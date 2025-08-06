import React, { useState, useEffect } from "react";
import data from "../data";
import emojis from "../emojis";

function Data({ img, onClickShow, time, emoji, alpha }) {
  const emojisArr = [];
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(function () {
      setShow(true);
    }, 800 + time * 150);
    if (show) {
      emojisArr.push(shuffledArray[emojiNum]);
      //   console.log(emojisArr);
    }
  }, []);
  function onClickShow(value) {
    setShow(value);
  }
  return (
    <div
      className={
        show
          ? " w-[1.70rem]  my-[0.24rem] transition  ease-in duration-100 inline"
          : " w-[1.70rem]  my-[0.24rem]   inline"
      }
    >
      {!show ? (
        <img
          src={img}
          cl
          className={show ? "invisible w-8" : "inline w-8"}
          alt=""
        />
      ) : (
        emoji
      )}
      {/* <span>{emojiNum}</span> */}
    </div>
  );
}

export default Data;
