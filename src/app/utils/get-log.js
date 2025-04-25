import { getAuth } from "firebase/auth";

export const getCurrentUserAndDate = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const currentDate = new Date();

    return {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
      timestamp: currentDate,
      formattedDate: currentDate.toLocaleDateString("pt-BR"),
      formattedTime: currentDate.toLocaleTimeString("pt-BR"),
    };
  } catch (error) {
    console.error("Error getting current user and date:", error);
    throw error;
  }
};
