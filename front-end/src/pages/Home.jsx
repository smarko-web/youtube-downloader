import { Link } from "react-router-dom";
const Home = () => {
  return (
    <section>
        <button>
            <Link to='/video'>
                convert video
            </Link>
        </button>
        <button>
            <Link to='/audio'>
                convert audio
            </Link>
        </button>
    </section>
  )
}
export default Home;