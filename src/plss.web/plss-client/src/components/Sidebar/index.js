export default function Sidebar() {
  return (
    <div id="sidebar" className="z-10 ease-in-out duration-300 h-screen w-16 menu bg-gray-100 text-white px-4 flex flex-col items-start justify-between fixed shadow overflow-y-auto overflow-x-hidden">
      <div className="w-full flex flex-col">
        <div className="-ml-2 w-16">
          <svg id="svg-logo" className="w-12" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 155">
            <g id="peak" className="fill-current text-indigo-400">
              <path d="M204.37,37.51l51.91,51.85c14.12,0.71,27.68,1.7,40.52,2.95L204.37,0,111.8,92.45c12.85-1.27,26.43-2.29,40.59-3Z"></path>
            </g>
            <g id="hills" className="fill-current text-indigo-600">
              <path d="M149.78,39.37L131.09,20.7,50,101.71c13.38-2.9,28.72-5.41,45.59-7.47Z"></path>
              <path d="M278.92,20.7l-18.7,18.67,54.21,54.86c16.88,2.06,32.22,4.58,45.59,7.47Z"></path>
            </g>
            <g id="land" className="fill-current text-indigo-700">
              <path d="M370.39,114.15c-30.68-7.7-74.28-13.22-124.17-15.21L203.88,56.66,161.46,99c-50.24,2.12-93.95,7.83-124.26,15.74-17,4.43-29.84,9.57-37.19,15.15,22.44-5.19,52.15-9.49,86.72-12.5,23.16-2,48.51-3.46,75.31-4.22L203.88,155l41.92-41.87c27.61,0.74,53.7,2.2,77.48,4.28,34.57,3,64.28,7.31,86.72,12.5-7.7-5.84-21.38-11.19-39.61-15.77M220.9,107.92l-14.55,14.54-2.43,19.6-2.62-19.71-14.06-14-21.4-2.65,22-2.91L201.5,89.12,203.88,70l2.56,19.33,13.21,13.19,21.86,2.71Z"></path>
            </g>
            <g id="dots" className="fill-current text-indigo-300">
              <path d="M8.36,133.81l1.09,7.44,13.35-1.94-1.09-7.44Zm22.16-3.17,0.9,7.46,13.39-1.62L43.91,129Zm22.12-2.51,0.72,7.48,13.43-1.3-0.72-7.48ZM74.73,126l0.61,7.49,13.45-1.1-0.61-7.49ZM97,124.24l0.53,7.5,13.46-1-0.53-7.5Zm22.2-1.54,0.38,7.51,13.48-.68-0.38-7.5ZM155,121.07l-13.48.47,0.27,7.51,13.48-.47Z"></path>
              <path d="M385.76,131.87l-1.08,7.44L398,141.25l1.09-7.44ZM363.55,129l-0.9,7.46L376,138.11l0.91-7.46Zm-22.15-2.19-0.72,7.48,13.43,1.3,0.73-7.48Zm-22.12-2-0.61,7.49,13.46,1.1,0.61-7.49ZM297,123.29l-0.53,7.5,13.46,1,0.54-7.5ZM274.83,122l-0.38,7.5,13.48,0.68,0.38-7.51Zm-22.61,6.56L265.71,129l0.27-7.51-13.48-.47Z"></path>
            </g>
          </svg>
        </div>
        <div>
          <span className="opacity-0 ease-in-out duration-300 w-full md:pb-0 text-gray-800 font-extrabold text-3xl whitespace-no-wrap">Utah PLSS</span>
        </div>
      </div>
      <ul className="list-reset ">
        <li className="my-2 md:my-0">
          <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400">
            <i className="fas fa-home fa-fw mr-3"></i>
            <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">Home</span>
          </a>
        </li>
        <li className="my-2 md:my-0 ">
          <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400">
            <i className="fas fa-tasks fa-fw mr-3"></i>
            <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">Layers</span>
          </a>
        </li>
        <li className="my-2 md:my-0">
          <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400">
            <i className="fa fa-inbox fa-fw mr-3"></i>
            <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">My Content</span>
          </a>
        </li>
        <li className="my-2 md:my-0">
          <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400">
            <i className="fas fa-wallet fa-fw mr-3"></i>
            <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">Tie sheets</span>
          </a>
        </li>
        <li className="my-2 md:my-0">
          <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400">
            <i className="fa fa-print fa-fw mr-3"></i>
            <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">Print</span>
          </a>
        </li>
      </ul>
      <a href="#" className="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-indigo-400 flex flex-row">
        <img className="w-8 h-8 rounded-full mb-4" src="http://i.pravatar.cc/300" alt="Avatar of User" />
        <div className="pl-2">
          <span className="absolute opacity-0 ease-in-out duration-300 w-full inline-block pb-1 md:pb-0 text-sm">Surveyor Name</span>
        </div>
      </a>
    </div>
  );
}
