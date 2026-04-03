import { navIcons, navLinks } from "#constants";
import dayjs from "dayjs";

const Navbar = () => {
    return (
        <nav className="relative z-50">
            <div className="flex items-center gap-4">
                <img src="/images/logo.svg" alt="logo" className="w-5 h-5"/>
                <p className="font-bold whitespace-nowrap">Yousef's Portfolio</p>
                <ul className="flex items-center gap-3">
                    {navLinks.map(({ id, name }) => (
                        <li key={id} className="relative">
                            <p className="z-10 p-1 rounded text-sm cursor-pointer hover:bg-blue-200 hover:text-blue-900 transition-all">{name}</p>
                        </li>
                    ))
                    }
                </ul>
            </div>
            <div>
                <ul>
                    {navIcons.map(({ id, img }) => (
                        <li key={id}>
                            <img src={img} alt={`icon-${id}`} className="icon-hover"/>
                        </li>
                    ))
                    }
                </ul>
                <time>{dayjs().format('ddd MMM D   h:mm A')}</time>
            </div>
        </nav>
    )
}

export default Navbar;