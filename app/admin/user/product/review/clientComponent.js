"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import style from "./review.module.css";
import Image from "next/image";

const ClientComponent = ({ name, _id, token, image }) => {
  const [wait, setWait] = useState(false);
  const [newRating, setNewRating] = useState(false);
  const commentData = useRef("");
  const router = useRouter();
  const ratingChoose = (e) => {
    setNewRating(e.target.value);
  };
  const submitButton = async (event) => {
    event.preventDefault();

    const comment = commentData.current.value;
    if (newRating && comment) {
      setWait(true);
      const create = await fetch(
        `${process.env.PROTOCOL_AND_HOST}/api/admin/user/product/review`,
        {
          method: "POST",
          body: JSON.stringify({
            token,
            newRating: Number(newRating),
            comment,
            _id: Number(_id),
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await create.json();
      const { success, message } = result;
      if (success) {
        alert(message);
        setTimeout(() => router.replace("/"), 1000);
      } else {
        setWait(false);
        alert(message);
      }
    } else {
      setWait(false);
      alert("Rating is mandatory");
    }
  };

  return (
    <section id="productUser" className={style.section}>
      <form onSubmit={submitButton} className={style.mainContainer}>
        <h1>{name}</h1>
        <div className={style.imgCover}>
          <Image src={image} height={100} width={100} alt="product images" />
        </div>
        <div className={style.rating}>
          <input
            onClick={ratingChoose}
            type="radio"
            id="star5"
            name="rating"
            value={5}
          />
          <label htmlFor="star5"></label>
          <input
            onClick={ratingChoose}
            type="radio"
            id="star4"
            name="rating"
            value={4}
          />
          <label htmlFor="star4"></label>
          <input
            onClick={ratingChoose}
            type="radio"
            id="star3"
            name="rating"
            value={3}
          />
          <label htmlFor="star3"></label>
          <input
            onClick={ratingChoose}
            type="radio"
            id="star2"
            name="rating"
            value={2}
          />
          <label htmlFor="star2"></label>
          <input
            onClick={ratingChoose}
            type="radio"
            id="star1"
            name="rating"
            value={1}
          />
          <label htmlFor="star1"></label>
        </div>
        <label className={style.commentLabel} htmlFor="comment">
          Wright Comment
        </label>

        <textarea
          maxLength={300}
          required
          ref={commentData}
          name="comment"
          minLength={10}
          className={style.commentInput}
          id="comment"
          type="text"
          placeholder="What did you like or dislike? About this product, please share with everyone"
        />
        {wait ? (
          <p className={style.wait}></p>
        ) : (
          <button className={style.submitBtn} type="submit">
            Submit
          </button>
        )}
      </form>
    </section>
  );
};

export default ClientComponent;
