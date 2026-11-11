const router = require('express').Router()
const { uploadToCloudinary , cloudinary } = require('../config/cloudinaryUtil')
const { parseTags } = require('../utils/parseTags')
const { prisma } = require('../db/prisma')
const { authMiddleware } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload')

// Internal fields the client should never receive.
// Used as `omit: HIDDEN` on every query that returns a resource.
const HIDDEN = { publicId: true }
// Query fragment: also fetch each join row's tag name
const WITH_TAGS = {
  tags: { select: { tag: { select: { name: true } } } },
}

// Turn [{ tag: { name: 'midterm' } }, ...] into ['midterm', ...]
function formatResource(resource) {
  return { ...resource, tags: resource.tags.map((rt) => rt.tag.name) }
}// Deletes a file from Cloudinary and NEVER throws.
// A failed cleanup is logged, not allowed to break the request.
async function destroyFile(publicId) {
  if (!publicId) return // rows created before the publicId column have none
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
  } catch (error) {
    console.error('Cloudinary cleanup failed for', publicId, error)
  }
}

// ---------- CREATE ----------
// Order matters: auth first (strangers can't push bytes at us), then multer,
// then validate text fields BEFORE uploading so bad requests create no files.
router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  let uploaded = null // remembers the Cloudinary result so we can clean up on failure
  try {
    // multipart text fields arrive as strings; req.body can be undefined in Express 5
    const { title, description, resourceType, courseId } = req.body ?? {}

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'title is required and must be a non-empty string',
      })
    }
    if (typeof resourceType !== 'string' || !resourceType) {
      return res.status(400).json({ success: false, message: 'resourceType is required' })
    }
    if (typeof courseId !== 'string' || !courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' })
    }
    if (description != null && typeof description !== 'string') {
      return res.status(400).json({ success: false, message: 'description must be a string' })
    }

    const tagNames = parseTags(req.body.tags)

    if (tagNames.length > 5) {
      return res.status(400).json({ success: false, message: 'A resource can have at most 5 tags' })
    }
    if (tagNames.some((name) => name.length > 30)) {
      return res.status(400).json({ success: false, message: 'Each tag must be 30 characters or fewer' })
    }

    if (!req.file || !req.file.buffer || !req.file.originalname) {
      return res.status(400).json({ success: false, message: 'Please attach a valid file' })
    }

    uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname)

    const newResource = await prisma.resource.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        resourceType, // an invalid enum value makes Prisma throw -> error handler
        courseId,
        uploaderId: req.user.id, // from the token, never from the body
        fileUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        tags: {
            create: tagNames.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },   // does a tag with this name exist?
                  create: { name },  // if not, make it
                },
              },
            })),
          },
      },
      omit: HIDDEN,
      include : formatResource(newResource)
    })

    return res.status(201).json({
      success: true,
      message: 'Resource added successfully!',
      data: newResource,
    })
  } catch (error) {
    // ORPHAN CLEANUP: the upload succeeded but something after it failed
    // (e.g. a nonexistent courseId), so remove the stray file.
    if (uploaded) await destroyFile(uploaded.public_id)
    next(error)
  }
})

// ---------- LIST ----------
router.get('/', async (req, res, next) => {
  try {
    const { course, type } = req.query
    const where = {}

    // query values can be arrays (?course=a&course=b), so accept only non-empty strings
    if (typeof course === 'string' && course) where.courseId = course
    if (typeof type === 'string' && type) where.resourceType = type

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
       include: WITH_TAGS,
      omit: HIDDEN,
    })

    // a list is never a 404: empty result is still 200 with []
    return res.json({
      success: true,
      message: resources.length ? 'Resources retrieved successfully!' : 'No resources found',
      data: resources.map(formatResource),
    })
  } catch (error) {
    next(error)
  }
})

// ---------- GET ONE ----------
// Keep any fixed paths like '/mine' ABOVE this route, or '/:id' will swallow them.
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        // `select` inside `include` limits which fields of the relation come back
        uploader: { select: { id: true, name: true } }, // uploader can be null (SetNull)
        course: { select: { title: true, code: true } },
         ...WITH_TAGS
      },
      omit: HIDDEN,
    })

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }

    return res.json({ success: true, message: 'Resource found', data: formatResource(resource) })
  } catch (error) {
    next(error) // a malformed id lands here; the error handler maps it to 400
  }
})

// ---------- DELETE ----------
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { id: userId, role } = req.user

    const resource = await prisma.resource.findUnique({ where: { id } })

    // 404 check FIRST, otherwise reading resource.uploaderId crashes on null
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }

    // allowed if owner OR admin, so deny when the user is neither.
    // If the uploader was deleted, uploaderId is null and only an admin passes.
    if (resource.uploaderId !== userId && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this resource',
      })
    }

    // Row first, file second. The row is the source of truth: if the file
    // removal fails afterwards we only leave an invisible orphan in Cloudinary,
    // whereas the other order could leave a resource page pointing at a dead file.
    await prisma.resource.delete({ where: { id } })
    await destroyFile(resource.publicId)

    return res.status(204).send() // 204 = no body
  } catch (error) {
    next(error) // P2025 (already deleted by a concurrent request) -> 404 in the handler
  }
})


module.exports = router