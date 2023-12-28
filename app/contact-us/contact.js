"use client";
import React, { Fragment, useState } from "react";
import style from "./contact.module.css";
import { Wait } from "../Layouts/toastAndWait";
import { useRouter } from "next/navigation";
import saveMessage from "./userMessage";
const Contact = ({ Link, email, lName, fName }) => {
  const [wait, setWait] = useState();
  const router = useRouter();

  const submitFunc = async (formData) => {
    const cUsTopic = formData.get("cUsTopic");
    if (!cUsTopic) {
      return alert("please select your topic");
    }
    const privacy = formData.get("privacy");
    if (!privacy) {
      return alert("please check privacy policy");
    }
    (
      await function () {
        setWait(true);
      }
    )();

    const request = await saveMessage({
      cUsName: formData.get("cUsName"),
      cUsEmail: formData.get("cUsEmail"),
      cUsTopic,
      cUsMessage: formData.get("cUsMessage"),
    });

    const { success, message } = request;
    alert(message);
    if (success) {
      router.replace("/");
    } else {
      setWait();
    }
  };

  return (
    <Fragment>
      {wait ? <Wait /> : null}
      <form className={style.form} action={submitFunc}>
        <h2>Your questions will definitely be answered</h2>
        <label htmlFor="cUsName">Your Name: </label>
        <input
          defaultValue={`${fName || ""} ${lName || ""}`}
          required
          minLength={5}
          maxLength={30}
          type="text"
          name="cUsName"
          id="cUsName"
        />
        <label htmlFor="cUsEmail">Your Email: </label>
        <input
          defaultValue={email || ""}
          required
          minLength={5}
          maxLength={30}
          type="email"
          name="cUsEmail"
          id="cUsEmail"
        />
        <label htmlFor="cUsTopic">Your Name: </label>
        <select className={style.select} name="cUsTopic" id="cUsTopic">
          <option value="">-- Please Select --</option>
          <option value="Delivery">Delivery</option>
          <option value="Warranty">Warranty</option>
          <option value="Availability">Availability</option>
          <option value="Other">Other</option>
        </select>
        <label htmlFor="cUsMessage">Message:</label>
        <textarea
          required
          minLength={5}
          maxLength={200}
          type="text"
          name="cUsMessage"
          id="cUsMessage"
        />
        <div className={style.privacy}>
          <input type="checkbox" name="privacy" id="privacy" />
          <label htmlFor="privacy">i have read and agree to tha </label>
          <Link href="?"> Privacy Policy</Link>
        </div>
        <button type="submit">Submit</button>
      </form>
    </Fragment>
  );
};

export default Contact;
