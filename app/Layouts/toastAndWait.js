import style from "./toastAndWait.module.css";

export function Wait() {
  return (
    <div className={style.fullSWait}>
      <div className={style.progressBar}>
        <p className={style.progressText}></p>
      </div>
    </div>
  );
}
