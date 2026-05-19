/* eslint-disable react-hooks/purity */
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { app } from "./firebase.config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFacebook } from "@fortawesome/free-brands-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const SignUp = () => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: false,
  });

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((results) => {
        const { displayName, email, photoURL } = results.user;
        const signedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        };
        setUser(signedInUser);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.message);
      });
  };
  const handleSignOut = () => {
    signOut(auth)
      .then((res) => {
        // Sign-out successful.
        const signedOutUser = {
          isSignIn: false,
          name: "",
          email: "",
          photo: "",
        };
        setUser(signedOutUser);
        console.log(res);
      })
      .catch((error) => console.log(error.message));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`
      UUID: ${Math.random(10).toString(25).substring(2)}
      Name: ${user.name} 
      Email: ${user.email} 
      Password: ${user.password}`);
    if (isNewUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          console.log("user info", res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          const errorCode = error.code;
          const errorText = errorCode;
          newUserInfo.error = errorText;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!isNewUser) {
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);

          console.log(res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          const errorCode = error.code;
          const errorText = errorCode;
          newUserInfo.error = errorText;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
  };
  const handleChange = (e) => {
    let isFormValid = true;

    if (e.target.name === "email") {
      isFormValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        e.target.value,
      );
    }
    if (e.target.name === "password") {
      const passwordValid =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(e.target.value);
      isFormValid = passwordValid;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  };

  const updateUserName = (name) => {
    updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(() => {
        console.log("user profile updated succesfully");
      })
      .catch((error) => {
        // An error occurred
        console.log(error);
      });
  };
  return (
    <>
      <div>
        <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-288.75"
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
              Contact sales
            </h2>
            <p className="mt-2 text-lg/8 text-gray-600">
              Aute magna irure deserunt veniam aliqua magna enim voluptate.
            </p>
          </div>
          <div className="flex gap-x-4 sm:col-span-2 items-center justify-center mt-5 mb-0">
            <div className="flex h-6 items-center">
              <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
                <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
                <input
                  id="agree-to-policies"
                  name="agree-to-policies"
                  type="checkbox"
                  aria-label="Agree to policies"
                  className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                  onClick={() => setIsNewUser(!isNewUser)}
                />
              </div>
            </div>
            <label
              htmlFor="agree-to-policies"
              className="text-sm/6 text-gray-600">
              Are you new user here?
            </label>
          </div>
          <form
            action="#"
            method="POST"
            className="mx-auto mt-16 max-w-xl sm:mt-20"
            onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {isNewUser && (
                <>
                  {" "}
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm/6 font-semibold text-gray-900">
                      First name
                    </label>
                    <div className="mt-2.5">
                      <input
                        onChange={handleChange}
                        id="first-name"
                        name="first-name"
                        type="text"
                        autoComplete="given-name"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm/6 font-semibold text-gray-900">
                      Last name
                    </label>
                    <div className="mt-2.5">
                      <input
                        onChange={handleChange}
                        id="last-name"
                        name="last-name"
                        type="text"
                        autoComplete="family-name"
                        className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-semibold text-gray-900">
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    onChange={handleChange}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  />
                </div>
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-semibold text-gray-900">
                  Password
                </label>
                <div className="mt-2.5">
                  <input
                    onChange={handleChange}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="password"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="phone-number"
                  className="block text-sm/6 font-semibold text-gray-900">
                  Phone number
                </label>
                <div className="mt-2.5">
                  <div className="flex rounded-md bg-white outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                    <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country"
                        aria-label="Country"
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 pr-7 pl-3.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                        <option>BD</option>
                        <option>CA</option>
                        <option>EU</option>
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                    <input
                      onChange={handleChange}
                      id="phone-number"
                      name="phone-number"
                      type="text"
                      placeholder="123-456-7890"
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="block text-sm/6 font-semibold text-gray-900">
                  Message
                </label>
              </div>
              <div className="flex gap-x-4 sm:col-span-2">
                <div className="flex h-6 items-center">
                  <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
                    <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
                    <input
                      id="agree-to-policies"
                      name="agree-to-policies"
                      type="checkbox"
                      aria-label="Agree to policies"
                      className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                    />
                  </div>
                </div>
                <label
                  htmlFor="agree-to-policies"
                  className="text-sm/6 text-gray-600">
                  By selecting this, you agree to our{" "}
                  <a
                    href="#"
                    className="font-semibold whitespace-nowrap text-indigo-600">
                    privacy policy
                  </a>
                  .
                </label>
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer">
                Sign up
              </button>
            </div>
          </form>
          <div className="socialAuth flex items-center justify-center my-3 gap-5">
            <div className="flex items-center justify-center my-3 googleAuth">
              {user.isSignIn ? (
                <button
                  onClick={handleSignOut}
                  className="border p-2 rounded-md border-sky-600 cursor-pointer text-xl text-sky-600">
                  <FontAwesomeIcon icon={faArrowRightFromBracket} /> Sign Out
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="border p-2 rounded-md border-sky-600 cursor-pointer">
                  <span className="text-blue-700 font-bold text-xl">G</span>
                  <span className="text-red-600 font-bold text-xl">o</span>
                  <span className="text-orange-500 font-bold text-xl">o</span>
                  <span className="text-blue-700 font-bold text-xl">g</span>
                  <span className="text-green-700 font-bold text-xl">l</span>
                  <span className="text-red-600 font-bold text-xl">e</span>
                </button>
              )}
              {user.isSignIn && (
                <div>
                  <p>Welcome, {user.name}</p>
                  <p>Your email: {user.email}</p>
                  <img
                    src={user.photo}
                    alt={user.name}
                    width={180}
                    height={180}
                  />
                </div>
              )}
            </div>
            <div className="fbAuth flex items-center justify-center my-3">
              <button className="border p-2 rounded-md border-sky-600 cursor-pointer text-xl text-sky-600">
                <FontAwesomeIcon icon={faSquareFacebook} size="xl" />
                Facebook
              </button>
            </div>
          </div>
        </div>

        <p style={{ color: "red" }}>{user.error}</p>
        {user.success && (
          <p style={{ color: "green" }}>
            User account {isNewUser ? "created" : "logged in"} successfully
          </p>
        )}
      </div>
    </>
  );
};

export default SignUp;
