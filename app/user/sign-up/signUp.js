"use client";
import { useEffect, useState } from "react";
import style from "./signUp.module.css";
import { useRouter } from "next/navigation";
import { Wait } from "@/app/Layouts/toastAndWait";
const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const SignUpComponent = ({ Link }) => {
  const router = useRouter();
  const [wait, setWait] = useState(false);
  const [birth, setBirth] = useState();
  const [state, setState] = useState("Chhattisgarh");
  const [districts, setDistricts] = useState([]);
  const [email, setEmail] = useState();

  function signUpFunction(formData) {
    let mobileNo = formData.get("mobileNo");
    let pinCode = formData.get("pinCode");

    if (pinCode.length != 6) {
      return alert("Please check pinCode ");
    }

    if (mobileNo.charAt(0) == 0) {
      mobileNo = mobileNo.slice(1);
    }
    if (mobileNo.length != 10) {
      return alert("Please check mobile number");
    }
    setWait(true);
    setTimeout(async () => {
      const request = await fetch(`/api/user/create-new-account`, {
        method: "POST",
        body: JSON.stringify({
          fName: formData.get("fName"),
          lName: formData.get("lName"),
          address: formData.get("address"),
          pinCode,
          district: formData.get("district"),
          state,
          mobileNo,
          email,
          gender: formData.get("gender"),
          birth: birth.dateType,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { success, message } = await request.json();
      if (success) {
        alert(message);
        setWait(false);
        router.replace("/user/verification/email");
      } else {
        setTimeout(() => {
          setWait(false);
          if (message === "already has an account created") {
            router.replace("/user/login");
          }
        }, 1);
        alert(message);
      }
    }, 1000);
  }

  useEffect(() => {
    const findDistricts = async () => {
      const find = await fetch(
        `${process.env.PROTOCOL_AND_HOST}/api/districts?key=${state}`
      );
      setDistricts((await find.json()).state);
    };
    findDistricts();
  }, [state]);

  return (
    <section className={style.section}>
      {wait ? <Wait /> : null}
      <div className={style.container}>
        <h1>Create Account</h1>
        <form className={style.firstStep} action={signUpFunction}>
          <label htmlFor="fName">First Name</label>
          <input required name="fName" id="fName" type="text" />
          <label htmlFor="lName">Last Name (surname)</label>
          <input required name="lName" id="lName" type="text" />
          <div className={style.email}>
            <label htmlFor="email">Email</label>{" "}
            <input
              onChange={(e) => {
                let [userName, domain] = e.target.value.split("@");
                const regex = /^[a-z0-9]+$/i;
                userName = userName.toLowerCase().trim();
                setEmail((pre) => {
                  if (userName.length > 1) {
                    if (regex.test(userName)) {
                      e.target.value = userName;
                      return userName;
                    } else {
                      e.target.value = pre;
                      return pre;
                    }
                  } else {
                    e.target.value = userName;
                    return userName;
                  }
                });
              }}
              required
              id="email"
              type="text"
            />
            <span>@gmail.com</span>
          </div>
          <div className={style.stateContainer}>
            <label htmlFor="mobileNo">Mobile Number</label>
            <label htmlFor="state">State</label>
            <input name="mobileNo" required id="mobileNo" type="number" />
            <select
              onChange={(e) => {
                setState(e.target.value);
              }}
              name="state"
              id="state"
              defaultValue={state}
            >
              {states.map((sta) => (
                <option value={sta} key={sta}>
                  {sta}
                </option>
              ))}
            </select>
            <label htmlFor="PinCode">PinCode</label>
            <label htmlFor="city">District</label>
            <input name="pinCode" required type="number" />
            <select name="district" id="district">
              {districts.map((dis) => (
                <option value={dis} key={dis}>
                  {dis}
                </option>
              ))}
            </select>
          </div>

          <label htmlFor="address">Address</label>
          <input name="address" required id="address" type="text" />

          <div className={style.personalInfo}>
            <p>Gender</p>
            <label htmlFor="male">
              Male
              <input
                type="radio"
                required
                name="gender"
                id="male"
                value="male"
              />
            </label>

            <label htmlFor="female">
              Female{" "}
              <input
                type="radio"
                required
                name="gender"
                id="female"
                value="female"
              />
            </label>
          </div>
          <div className={style.personalInfo}>
            <p>Date Of Birth</p>
            <input
              required
              onChange={(e) => {
                const value = e.target.value;
                const currentYear = new Date().getFullYear();
                const [year, month, date] = value.split("-");
                if (currentYear - 4 > +year && currentYear - 80 < +year) {
                  setBirth({
                    textType: `${date}-${month}-${year}`,
                    dateType: value,
                  });
                } else {
                  e.target.value = "";
                  setBirth();
                  alert(
                    "Anyone above 4 years of age and below 80 years can sign up."
                  );
                }
              }}
              type="date"
              name=""
              id=""
            />
            <span>{birth?.textType}</span>
          </div>
          <button type="submit">Verify</button>
          <p>
            Already have an account? <Link href="/user/login"> Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default SignUpComponent;
