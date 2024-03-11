"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import style from "./signUp.module.css";
import { useRouter } from "next/navigation";
import { UserAlert, Wait } from "@/app/Layouts/toastAndWait";
import { useDispatch, useSelector } from "react-redux";
import { commonUser } from "@/app/redux/slice/user";
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
  const dispatch = useDispatch();
  const { intTofP, searchKeys } = useSelector((data) => data.activity);
  const router = useRouter();
  const [firstStep, setFirstStep] = useState({});
  const [wait, setWait] = useState(false);
  const [birth, setBirth] = useState();
  const [state, setState] = useState();
  const [district, setDistrict] = useState();
  const [districts, setDistricts] = useState([]);
  const [email, setEmail] = useState();
  const password = useRef();
  const confirmPassword = useRef();
  let { holdTokenSent, tokensSent } = firstStep;
  const currentYear = new Date().getFullYear();

  const showWarning = (message) => {
    setWait({ type: "Warning", message });
    setTimeout(() => setWait(false), 3000);
  };

  function signUpFunction(formData) {
    if (wait) return;
    if (holdTokenSent) {
      holdTokenSent = new Date(holdTokenSent);
      if (holdTokenSent > Date.now()) {
        const pendingTime = ((holdTokenSent - Date.now()) / 60 / 60 / 1000)
          .toFixed(2)
          .toString();

        const [hours, minute] = pendingTime.split(".");
        return showWarning(
          `Try After: ${
            pendingTime.length > 2
              ? `${hours}:hours ${minute}:minutes`
              : `${minute}: minutes`
          }`
        );
      }
    }
    const passwordInput = password.current?.value;
    const confirmInput = confirmPassword.current?.value;
    if (passwordInput !== confirmInput) {
      return showWarning("Password not matching");
    }
    let mobileNo = formData.get("mobileNo");
    let pinCode = formData.get("pinCode");

    if (pinCode.length != 6) {
      return showWarning("Please check pinCode ");
    }

    if (mobileNo.charAt(0) == 0) {
      mobileNo = mobileNo.slice(1);
    }
    if (mobileNo.length != 10) {
      return showWarning("Please check mobile number");
    }
    const validCode = formData.get("validCode");
    if (validCode && validCode == firstStep.validCode) {
      return showWarning("Enter New Verification Code");
    }
    setWait(true);
    setTimeout(async () => {
      const data = {
        fName: formData.get("fName"),
        lName: formData.get("lName"),
        address: formData.get("address"),
        pinCode,
        district,
        state,
        mobileNo,
        email,
        gender: formData.get("gender"),
        birth,
        validCode,
        password: passwordInput,
        intTofP,
        searchKeys,
      };
      const request = await fetch(`/api/user/create-new-account`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { success, message, tokensSent } = await request.json();

      if (request.status == 201) {
        localStorage.removeItem("newAccount");
        localStorage.removeItem("IntTofP");
        localStorage.removeItem("SearchKeys");
        router.replace("/");
        dispatch(
          commonUser({
            oldData: tokensSent,
            oldToken: tokensSent.token,
            connectIn: "login",
          })
        );
      } else {
        if (message.includes("try after:")) {
          data.holdTokenSent = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        data.tokensSent = tokensSent ? tokensSent + 1 : 1;
        localStorage.setItem("newAccount", JSON.stringify(data));
        setFirstStep(data);
      }
      if (success) {
        setWait({ type: "Success", message });
      } else {
        setWait({ type: "Error", message });
        if (message === "already has an account created") {
          setTimeout(() => {
            router.replace("/user/login");
          }, 5000);
        }
      }
      setTimeout(() => {
        setWait(false);
      }, 3000);
    }, 1000);
  }

  const fetchData = async (key, district) => {
    const find = await fetch(`/api/all/districts?state=${key}`);
    const result = (await find.json()).districts;
    setDistrict(() => false);
    setState(() => false);
    setTimeout(() => {
      setState(key);
      setDistrict(district || result[0]);
    }, 500);
    setDistricts(result);
  };

  useEffect(() => {
    let data = localStorage.getItem("newAccount");
    if (data) {
      data = JSON.parse(data);
      setFirstStep(data);
      const { birth, email, state, district, gender } = data;
      document.getElementById(gender).checked = true;
      setBirth(birth);
      setEmail(email);
      fetchData(state, district);
    } else {
      fetchData("Chhattisgarh", "Raipur");
    }
  }, []);

  function funcSetPassword(e) {
    const input = e.target.value;
    let length = input.length;
    const inputName = e.target.name;
    if (input.includes(" ")) {
      e.target.value = input.trim();
      return showWarning("space not allow");
    }

    const match = (inputName === "confirmPassword" ? password : confirmPassword)
      .current.value;

    if (match.length == 0 || length == 0) {
      e.target.style.borderColor =
        length > 7
          ? "green"
          : length > 5
          ? "yellow"
          : length > 0
          ? "red"
          : "transparent";
    } else {
      for (let i = 0; i < length; i++) {
        if (match.charAt(i) === input.charAt(i)) {
          e.target.style.borderColor = "green";
        } else {
          if (length > 0) {
            e.target.style.borderColor = "red";
          } else {
            e.target.style.borderColor = "transparent";
          }
          length = 0;
        }
      }
    }
  }

  return (
    <section className={style.section}>
      {wait && <Wait />}
      {wait?.type && <UserAlert message={wait.message} type={wait.type} />}
      <div className={style.container}>
        <h1>Create Account</h1>
        <form className={style.firstStep} action={signUpFunction}>
          <label htmlFor="fName">First Name</label>
          <input
            defaultValue={firstStep.fName}
            required
            name="fName"
            id="fName"
            type="text"
            minLength={3}
          />
          <label htmlFor="lName">Last Name (surname)</label>
          <input
            defaultValue={firstStep.lName}
            required
            name="lName"
            id="lName"
            type="text"
            minLength={3}
          />
          <div className={style.email}>
            <label htmlFor="email">Email</label>
            <input
              defaultValue={firstStep.email}
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
            <input
              defaultValue={firstStep.mobileNo}
              name="mobileNo"
              required
              id="mobileNo"
              type="number"
            />
            {state ? (
              <select
                onChange={(e) => {
                  fetchData(e.target.value);
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
            ) : (
              <p className={style.skeleton}></p>
            )}
            <label htmlFor="PinCode">PinCode</label>
            <label htmlFor="city">District</label>
            <input
              name="pinCode"
              defaultValue={firstStep.pinCode}
              required
              type="number"
            />
            {district ? (
              <select defaultValue={district} name="district" id="district">
                {districts.map((dis) => (
                  <option value={dis} key={dis}>
                    {dis}
                  </option>
                ))}
              </select>
            ) : (
              <p className={style.skeleton}></p>
            )}
          </div>

          <label htmlFor="address">Address</label>
          <input
            defaultValue={firstStep.address}
            name="address"
            required
            id="address"
            type="text"
            minLength={10}
          />

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
              max={`${currentYear - 4}-01-01`}
              min={`${currentYear - 80}-01-01`}
              required
              defaultValue={birth?.dateType}
              onChange={(e) => {
                const value = e.target.value;
                const [year, month, date] = value.split("-");
                setBirth({
                  textType: `${date}-${month}-${year}`,
                  dateType: value,
                });
              }}
              type="date"
              name="birth"
              id="birth"
            />
            <span>{birth?.textType}</span>
          </div>
          {tokensSent > 0 && (
            <>
              <div className={style.checkMail}>
                <p>Check your mail inbox</p>
                <p></p>
              </div>
              <label htmlFor="password">Password</label>
              <input
                onChange={funcSetPassword}
                required
                name="password"
                id="password"
                ref={password}
                minLength={8}
                maxLength={20}
                type="password"
                placeholder="greater than 8 characters "
                className={style.password}
              />
              <label htmlFor="password">Confirm Password</label>
              <input
                onChange={funcSetPassword}
                required
                id="confirm"
                name="confirmPassword"
                ref={confirmPassword}
                minLength={8}
                maxLength={20}
                type="password"
                placeholder="greater than 8 characters "
                className={style.password}
              />
              <label className={style.verifyLabel} htmlFor="password">
                Enter 6 digit verification code
                <input
                  className={style.verifyInput}
                  name="validCode"
                  required
                  id="token"
                  minLength={6}
                  maxLength={6}
                  type="text"
                />
              </label>
            </>
          )}
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
