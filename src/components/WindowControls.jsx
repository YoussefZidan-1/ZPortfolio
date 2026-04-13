import useWindowStore from "#store/window.js";

const WindowControls = ({ target }) => {
  const { closeWindow, toggleMaximize } = useWindowStore();
  
  return (
    <div id="window-controls">
      <div className="close" onClick={() => closeWindow(target)} />
      <div className="minimize" onClick={() => closeWindow(target)}/>
      {/* Update the green button */}
      <div className="maximize" onClick={() => toggleMaximize(target)} />
    </div>
  )
}

export default WindowControls;