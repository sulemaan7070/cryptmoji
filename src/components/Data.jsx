import React, { useState, useEffect } from "react";
import data from "../data";
import emojis from "../emojis";
import shuffledArray from "../shuffledEmojis";

function Data({ img, onClickShow, time, emojiNum }) {
  const emojisArr = [];
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(function () {
      setShow(true);
    }, 800 + time * 150);
    if (show) {
      emojisArr.push(shuffledArray[emojiNum]);
      console.log(emojisArr);
    }
  }, []);
  function onClickShow(value) {
    setShow(value);
  }
  return (
    <div
      className={
        show
          ? " w-[1.70rem]  my-[0.24rem] transition  ease-in duration-100 "
          : " w-[1.70rem]  my-[0.24rem]   "
      }
    >
      {!show ? (
        <img src={img} className={show ? "invisible" : ""} alt="" />
      ) : (
        shuffledArray[emojiNum]
      )}
      {/* <span>{emojiNum}</span> */}
    </div>
  );
}

export default Data;
