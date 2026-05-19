import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase.config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFacebook } from "@fortawesome/free-brands-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Commet } from "react-loading-indicators";

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Map Firebase error codes → readable messages
const AUTH_ERRORS = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-credential":   "Invalid email or password.",
  "auth/user-not-found":       "No account found with this email.",
  "auth/wrong-password":       "Incorrect password.",
  "auth/too-many-requests":    "Too many attempts. Please try again later.",
  "auth/weak-password":        "Password must be at least 6 characters.",
};

const INITIAL_USER = {
  isSignIn:  false,
  firstName: "",
  lastName:  "",
  email:     "",
  password:  "",
  phone:     "",
  country:   "BD",
  photo:     "",
  error:     "",
  success:   false,
};

const SignUp = () => {
  const [isNewUser, setIsNewUser]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [user, setUser]             = useState(INITIAL_USER);

  // ── helpers ──────────────────────────────────────────────────────────────

  const setError = (msg) =>
    setUser((prev) => ({ ...prev, error: msg, success: false }));

  const setSuccess = () =>
    setUser((prev) => ({ ...prev, error: "", success: true }));

  // Save user data to Firestore
  const saveUserToFirestore = async (uid, data) => {
    await setDoc(doc(db, "users", uid), {
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      country:   data.country,
      createdAt: new Date().toISOString(),
    });
  };

  // ── auth handlers ─────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, displayName, email, photoURL } = result.user;

      // Only write to Firestore if this is a new Google user
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", uid), {
          name:      displayName,
          email:     email,
          createdAt: new Date().toISOString(),
        });
      }

      setUser((prev) => ({
        ...prev,
        isSignIn: true,
        name:     displayName,
        email:    email,
        photo:    photoURL,
        error:    "",
        success:  true,
      }));
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(INITIAL_USER);
    } catch (err) {
      setError("Sign-out failed. Please try again.");
      console.log(err);
      
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── client-side validation ──
    if (!user.email || !user.password) {
      return setError("Email and password are required.");
    }
    if (isNewUser && (!user.firstName || !user.lastName)) {
      return setError("Please enter your first and last name.");
    }
    if (isNewUser && !user.phone) {
      return setError("Phone number is required.");
    }

    setIsLoading(true);
    setError("");

    try {
      if (isNewUser) {
        // ── Sign Up ──
        const res = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        const { uid } = res.user;

        // Update Firebase Auth display name
        await updateProfile(res.user, { displayName: user.name });

        // Save full profile to Firestore
        await saveUserToFirestore(uid, user);

        setSuccess();
        console.log("Redirecto to dashboard code will written");
        
      } else {
        // ── Log In ──
        const res = await signInWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Fetch extra profile data from Firestore
        const snap = await getDoc(doc(db, "users", res.user.uid));
        const firestoreData = snap.exists() ? snap.data() : {};

        setUser((prev) => ({
          ...prev,
          isSignIn: true,
          name:     res.user.displayName || firestoreData.name || "",
          email:    res.user.email,
          photo:    res.user.photoURL || "",
          error:    "",
          success:  true,
        }));

      console.log("Redirecto to dashboard code will written");
      }
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name fields — no regex validation needed
    if (name === "firstName" || name === "lastName") {
      setUser((prev) => {
        const updated = { ...prev, [name]: value };
        updated.name  = `${updated.firstName} ${updated.lastName}`.trim();
        return updated;
      });
      return; // stop here — don't run the regex block below
    }

    // Email — validate format but always update state (show inline error instead)
    if (name === "email") {
      const valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      setUser((prev) => ({
        ...prev,
        email: value,
        error: valid || value === "" ? "" : "Please enter a valid email address.",
      }));
      return;
    }

    // Password — validate strength but always update state
    if (name === "password") {
      const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value);
      setUser((prev) => ({
        ...prev,
        password: value,
        error: valid || value === ""
          ? ""
          : "Password needs 6+ chars, uppercase, lowercase & a number.",
      }));
      return;
    }

    // All other fields (phone, country, etc.)
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        {/* background decoration */}
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

        {/* heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
            {isNewUser ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            {isNewUser
              ? "Fill in your details to get started."
              : "Sign in to your account."}
          </p>
        </div>

        {/* new-user toggle */}
        <div className="flex gap-x-4 sm:col-span-2 items-center justify-center mt-5 mb-0">
          <div className="flex h-6 items-center">
            <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2">
              <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
              <input
                id="new-user-toggle"
                name="new-user-toggle"
                type="checkbox"
                aria-label="Toggle new user"
                className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                onChange={() => {
                  setIsNewUser((prev) => !prev);
                  setUser(INITIAL_USER); // clear form on mode switch
                }}
              />
            </div>
          </div>
          <label htmlFor="new-user-toggle" className="text-sm/6 text-gray-600">
            Are you a new user?
          </label>
        </div>

        {/* form */}
        <form
          className="mx-auto mt-16 max-w-xl sm:mt-20"
          onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {/* first / last name — new users only */}
            {isNewUser && (
              <>
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm/6 font-semibold text-gray-900">
                    First name
                  </label>
                  <div className="mt-2.5">
                    <input
                      onChange={handleChange}
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm/6 font-semibold text-gray-900">
                    Last name
                  </label>
                  <div className="mt-2.5">
                    <input
                      onChange={handleChange}
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* email + password */}
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
                  required
                  className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
              </div>
              <label
                htmlFor="password"
                className="block text-sm/6 font-semibold text-gray-900 mt-4">
                Password
              </label>
              <div className="mt-2.5">
                <input
                  onChange={handleChange}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isNewUser ? "new-password" : "current-password"}
                  required
                  className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* phone — new users only */}
            {isNewUser && (
              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
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
                        onChange={handleChange}
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 pr-7 pl-3.5 text-base text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                        <option value="BD">BD</option>
                        <option value="US">US</option>
                        <option value="CA">CA</option>
                        <option value="EU">EU</option>
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                    <input
                      onChange={handleChange}
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="123-456-7890"
                      required
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* inline error */}
          {user.error && (
            <p className="mt-4 text-sm text-red-600">{user.error}</p>
          )}

          {/* submit */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={isLoading}
              className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Commet
                    color="#1709de"
                    size="medium"
                    text="Please wait"
                    textColor="#0465ff"
                  />
                </>
              ) : isNewUser ? (
                "Sign up"
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </form>

        {/* social auth */}
        <div className="socialAuth flex items-center justify-center my-3 gap-5">
          <div className="flex flex-col items-center justify-center my-3 gap-2 googleAuth">
            {user.isSignIn ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={user.photo}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="border p-2 rounded-md border-sky-600 cursor-pointer text-xl text-sky-600">
                  <FontAwesomeIcon icon={faArrowRightFromBracket} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="border p-2 rounded-md border-sky-600 cursor-pointer disabled:opacity-60">
                <span className="text-blue-700 font-bold text-xl">G</span>
                <span className="text-red-600 font-bold text-xl">o</span>
                <span className="text-orange-500 font-bold text-xl">o</span>
                <span className="text-blue-700 font-bold text-xl">g</span>
                <span className="text-green-700 font-bold text-xl">l</span>
                <span className="text-red-600 font-bold text-xl">e</span>
              </button>
            )}
          </div>

          <div className="fbAuth flex items-center justify-center my-3">
            <button
              disabled
              title="Facebook login coming soon"
              className="border p-2 rounded-md border-gray-300 cursor-not-allowed text-xl text-gray-400">
              <FontAwesomeIcon icon={faSquareFacebook} size="xl" />
              Facebook
            </button>
          </div>
        </div>

        {user.success && (
          <p className="text-center text-green-600 font-medium mt-2">
            {isNewUser
              ? "Account created successfully! Redirecting…"
              : "Logged in successfully! Redirecting…"}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUp;