import style from "./Header.module.css";
import Searchbar from "./searchbar";

const Header = ({ Link, Image, userInfo }) => {
  const { fName = "Profile", pinCode } = userInfo || {};

  return (
    <header className={style.header} id="header">
      <input
        className={style.sideBarInput}
        type="checkbox"
        name="sideBarBtn"
        id="sideBarBtn"
      />
      <label className={style.dropBox} htmlFor="sideBarBtn"></label>
      <nav>
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/duxuhsx8x/image/upload/v1693544100/SiteImages/logo_jyamdw.png"
            width={150}
            height={100}
            alt="Web Logo"
          />
        </Link>

        {fName ? (
          <div className={style.loggedIn}>
            <Link href="/admin/user/product/orders">
              <svg
                width="30px"
                height="30px"
                fill="#ffffff"
                viewBox="0 0 100 100"
              >
                <path
                  fill="#FF0000"
                  d="m90.5 63.6-21.7 6.8c.2-.5.3-1 .3-1.6.1-1.4-.4-2.8-1.4-3.9-1.1-1.2-2.6-1.8-4.2-1.8H49.6l-12-4.4c-2.9-1.1-6-1.6-9.2-1.6h-5.7v27.4H25c.9 0 1.8.2 2.7.5l25.7 9.1c.8.3 1.6.4 2.4.4 1.2 0 2.4-.3 3.5-.9l35.6-20.3c1.2-.6 2.1-1.6 2.7-2.8.1-.1.1-.2.1-.2.5-1.3.4-2.8-.2-4.1-1.2-2.7-4.4-3.8-7-2.6zM16.6 49.2H6c-2.2 0-4 1.8-4 4v34.7c0 2.2 1.8 4 4 4h10.6c2.2 0 4-1.8 4-4V53.3c.1-2.3-1.7-4.1-4-4.1zM65.8 18l4.5 4.1V5.4H59.9V22l4.5-4.1c.2-.2.4-.3.7-.3.3.1.5.2.7.4z"
                ></path>
                <path d="M44.9 5.4c-3.3 0-6.1 2.7-6.1 6.1V52c0 3.3 2.7 6.1 6.1 6.1H86c3.1-.3 5.5-2.9 5.5-6V11.5c0-3.3-2.7-6.1-6.1-6.1h-13v18.9c0 .4-.2.8-.6.9-.1.1-.3.1-.4.1-.2 0-.5-.1-.7-.3l-5.5-5-5.5 5c-.3.3-.7.3-1.1.2-.4-.2-.6-.5-.6-.9V5.4H44.9zm16.2 41.5H47c-.6 0-1-.5-1-1s.4-1 1-1h14.1c.6 0 1 .5 1 1s-.4 1-1 1zm0-10.1c.6 0 1 .4 1 1s-.4 1-1 1H47c-.6 0-1-.4-1-1s.4-1 1-1h14.1z"></path>
              </svg>
            </Link>
            <Link href="/admin/user/product/cart?num=0">
              <svg
                fill="#ffffff"
                width="30px"
                height="30px"
                viewBox="0 0 36 36"
              >
                <circle fill="#FF0000" cx="13.5" cy="29.5" r="2.5"></circle>
                <circle fill="#FF0000" cx="26.5" cy="29.5" r="2.5"></circle>
                <path d="M33.1,6.39A1,1,0,0,0,32.31,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l3.2-13A1,1,0,0,0,33.1,6.39Z"></path>
              </svg>
            </Link>
          </div>
        ) : null}

        <Link className={style.first} href="/">
          Men
        </Link>
        <Link href="/">Women</Link>
        <Link href="/">kitchen</Link>
        <Link href="/">Kids</Link>
        <Link href="/">Beauty & Health</Link>
        <Link href="/">Electronics</Link>
        <Link href="/">Sports & Fitness</Link>
        <Link href="/">Bags</Link>
        <Link href="/">Footwear</Link>
      </nav>
      <label className={style.sideBarBtn} htmlFor="sideBarBtn">
        <span className={style.first}></span>
        <span className={style.second}></span>
        <span className={style.third}></span>
      </label>
      <Searchbar />
      <Link href="/admin/user/account" className={style.profileLogo}>
        <svg className={style.svg} viewBox="0 0 24 24">
          <path
            fill="#ffffff"
            d="M5.84846399,13.5498221 C7.28813318,13.433801 8.73442297,13.433801 10.1740922,13.5498221 C10.9580697,13.5955225 11.7383286,13.6935941 12.5099314,13.8434164 C14.1796238,14.1814947 15.2696821,14.7330961 15.73685,15.6227758 C16.0877167,16.317132 16.0877167,17.1437221 15.73685,17.8380783 C15.2696821,18.727758 14.2228801,19.3149466 12.4926289,19.6174377 C11.7216312,19.7729078 10.9411975,19.873974 10.1567896,19.9199288 C9.43008411,20 8.70337858,20 7.96802179,20 L6.64437958,20 C6.36753937,19.9644128 6.09935043,19.9466192 5.83981274,19.9466192 C5.05537891,19.9062698 4.27476595,19.8081536 3.50397353,19.6530249 C1.83428106,19.3327402 0.744222763,18.7633452 0.277054922,17.8736655 C0.0967111971,17.5290284 0.00163408158,17.144037 0.000104217816,16.752669 C-0.00354430942,16.3589158 0.0886574605,15.9704652 0.268403665,15.6227758 C0.72692025,14.7330961 1.81697855,14.1548043 3.50397353,13.8434164 C4.27816255,13.6914539 5.06143714,13.5933665 5.84846399,13.5498221 Z M8.00262682,-1.16351373e-13 C10.9028467,-1.16351373e-13 13.2539394,2.41782168 13.2539394,5.40035587 C13.2539394,8.38289006 10.9028467,10.8007117 8.00262682,10.8007117 C5.10240696,10.8007117 2.75131423,8.38289006 2.75131423,5.40035587 C2.75131423,2.41782168 5.10240696,-1.16351373e-13 8.00262682,-1.16351373e-13 Z"
            transform="translate(4 2)"
          ></path>
        </svg>
        <span className={style.span}> {fName.substring(0, 8)}</span>
      </Link>
    </header>
  );
};
export default Header;
