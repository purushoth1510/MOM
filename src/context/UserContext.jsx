import {
  createContext,
  useState
} from "react";

export const UserContext =
  createContext();

export const UserProvider =
  ({ children }) => {

    const [user, setUser] = useState({
      name: localStorage.getItem("username") || "Guest",
      email: localStorage.getItem("email") || "",
      organization: "",
      role: ""
    });

    const [searchQuery, setSearchQuery] = useState("");

    return (
      <UserContext.Provider
        value={{
          user,
          setUser,
          searchQuery,
          setSearchQuery
        }}
      >

        {children}

      </UserContext.Provider>

    );

};

export default UserProvider;