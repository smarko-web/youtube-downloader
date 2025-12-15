import { Link } from "react-router-dom";
const Home = () => {
  return (
    <section className="h-[calc(100vh - 60px)] w-[90vw] min-w-[275px] max-w-[875px] absolute top-[70px] left-[50%] translate-x-[-50%] flex justify-center">
      <div className="flex flex-col items-center gap-6 pt-20">
        <Link
          to="/audio"
          role="button"
          className="inline-flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-lg text-lg font-medium shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
        >
          convert audio
        </Link>
        <Link
          to="/video"
          role="button"
          className="inline-flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-lg text-lg font-medium shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
        >
          convert video
        </Link>
      </div>
    </section>
  );
};
export default Home;