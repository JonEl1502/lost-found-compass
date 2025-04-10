
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./HomePage";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This is a redirect component, we're just rendering the HomePage directly
    // If we needed to do something else before rendering, we could do it here
  }, [navigate]);

  return <HomePage />;
};

export default Index;
