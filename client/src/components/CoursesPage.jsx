import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL;
// NOT process.env.VITE_API_URL
    
const CoursesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function getCourses() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${VITE_API_URL}/api/courses`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Fetching failed (HTTP ${res.status})`);
        }

        const courseData = await res.json();

        if (!cancelled) {
          setData(courseData.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (data.length === 0) return <p>No course Found !</p>;

  return (
    <div>
      {data.map((course) => (
        <div key={course.id}>
          <p>
            {course.title} : {course.code}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CoursesPage;