export default function Page404() {
  return (
    <>
      <div title={'The page is not found'}></div>
      <div className="hero min-h-screen bg-slate-800">
        <div className="hero-content text-center text-3xl font-bold">
          <div>
            <h1>The page is not found.</h1>
            <div className="mt-4">
              <a href="/" className="link-primary">
                Top Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
