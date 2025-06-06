
import moreIcon  from "../../assets/icons/more.svg";
import logoIcon  from "../../assets/icons/logo.svg";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import { Link, NavLink } from "react-router-dom";

const NavUser = () => {
  return (
   <div className="containerR">
    <div className="navbar__content">
        {/* <!-- More --> */}
        <button className="top-bar__more d-none d-lg-block " >
            <img src={moreIcon} alt="More" className="icon top-bar__more-icon" />
        </button>

        {/* <!-- Logo --> */}
        <a href="./" className="logo">
            <img src={logoIcon} alt="Nhà hàng Vạn Hoa" className="icon logo__img" />
            <h1 className="logo__title">Vạn Hoa</h1>
        </a>

        <div id="navbar__main" className="navbar__main hide">
            <button className="navbar__close-btn " >
                <img className="icon" src={arrowLeft} alt="Arrow left" />
            </button>

            <ul className="navbar__list">
                            <li className="navbar__item"><NavLink to={"/"} className="navbar__link">Home</NavLink></li>
                            <li className="navbar__item"><NavLink to={"menu"} className="navbar__link">Menu</NavLink></li>
                            <li className="navbar__item"><NavLink to={"/about"} className="navbar__link">About</NavLink></li>
                            <li className="navbar__item"><NavLink to={"reservation"} className="navbar__link">Reservation</NavLink></li>
                            <li className="navbar__item"><NavLink to={"/contact"} className="navbar__link">Contact</NavLink></li>
            </ul>
        </div>

        <div className="navbar__overlay " ></div>
        {/* <!-- Actions --> */}
        <div className="top-act">
            <Link to={"/login"} className="top-act__btn btn btn--text d-md-none">Sign in</Link>
            <Link to={"/register"} className="top-act__btn btn top-act__sign-up">Sign up</Link>
        </div>
    </div>
</div>
  );
}

export default NavUser;