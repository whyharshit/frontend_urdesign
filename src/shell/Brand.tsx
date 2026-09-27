import { Link } from 'react-router-dom';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand--light' : ''}`} aria-label="UrDesigner home">
      <svg className="brand-mark" viewBox="70 142 520 342" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M75 147H222V238C222 274 190 298 148 298C106 298 75 274 75 238Z M75 310H150C195 310 222 335 222 366C222 390 210 408 192 418L222 479H75Z M255 147H425C518 147 585 218 585 313C585 408 518 479 425 479H255Z"
        />
      </svg>
      <span>
        UrDesigner<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
