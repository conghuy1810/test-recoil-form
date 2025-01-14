import React from 'react';
import { useSpring, a } from '@react-spring/web';
import { useSetRecoilState } from 'recoil';
import { checkHideMenu } from 'atom/rootAtom';
import { useHistory } from 'react-router-dom';
import { useDrag } from 'react-use-gesture';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from './styles.module.css';
import './styles.css';

const calc = (x, y) => [x - window.innerWidth / 2, y - window.innerHeight / 2];
const water = (x, y) => `translate3d(${x / 10}px,${y / 10 + 240}px,0)`;
const cloud1 = (x, y) => `translate3d(${x / 7 + 150}px,${y / 7 + 20}px,0)`;
const island = (x, y) => `translate3d(${x / 5 - 200}px,${y / 5 + 110}px,0)`;
const cloud2 = (x, y) => `translate3d(${x / 12.5 - 30}px,${y / 12 - 190}px,0)`;

const left = {
  bg: `linear-gradient(120deg, #f093fb 0%, #f5576c 100%)`,
  justifySelf: 'end',
};
const right = {
  bg: `linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)`,
  justifySelf: 'start',
};
const Slider = ({ children }) => {
  const history = useHistory();

  const [{ x, bg, scale, justifySelf }, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    ...left,
  }));
  const bind = useDrag(({ active, movement: [x], last }) => {
    if (last) {
      history.push('/');
    }
    return api.start({
      x: active ? x : 0,
      scale: active ? 1.1 : 1,
      ...(x < 0 ? left : right),
      immediate: name => active && name === 'x',
    });
  });

  const avSize = x.to({
    map: Math.abs,
    range: [50, 300],
    output: [0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <a.div {...bind()} className={styles.item} style={{ background: bg }}>
      <a.div className={styles.av} style={{ scale: avSize, justifySelf }}>
        <ArrowForwardIcon style={{ height: 48, width: 48 }} />
      </a.div>
      <a.div
        className={styles.fg}
        style={{
          x,
          scale,
        }}
      >
        <span style={{ color: 'white' }}>{children}</span>
      </a.div>
    </a.div>
  );
};

function ErrorPage() {
  const setHideMenu = useSetRecoilState(checkHideMenu);
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));
  // React.useEffect(() => {
  //   setHideMenu(true);
  //   return () => {
  //     setHideMenu(false);
  //   };
  // }, []);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 300, color: '#00B74F' }}>4</div>
        <div
          className="container404"
          onMouseMove={({ clientX: x, clientY: y }) => set({ xy: calc(x, y) })}
        >
          <div className="sun" />
          <a.div
            className="cloud2"
            style={{ transform: props.xy.interpolate(cloud2) }}
          />
          <a.div
            className="cloud1"
            style={{ transform: props.xy.interpolate(cloud1) }}
          />
          <a.div
            className="water"
            style={{ transform: props.xy.interpolate(water) }}
          />
          <a.div
            className="island"
            style={{ transform: props.xy.interpolate(island) }}
          />
        </div>
        <div style={{ fontSize: 300, color: '#00B74F' }}>4</div>
      </div>
      <Slider>Slider to home</Slider>
    </div>
  );
}
export default ErrorPage;
