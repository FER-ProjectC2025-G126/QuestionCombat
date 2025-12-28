import Button1 from '../components/Button1';

function NotFoundPage() {
  return (
    <div className="notFound">
      <div className="notFoundContainer">
        <h1>404 - Page not found</h1>
        <Button1 to="/" text="Go to Home" className="btn" />
      </div>
    </div>
  );
}

export default NotFoundPage;
