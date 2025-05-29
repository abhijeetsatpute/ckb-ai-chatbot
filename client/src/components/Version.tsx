import { useEffect } from "react";

const Version = ({ version = "1.0.0" }) => {
  useEffect(() => {
    console.log(
      `%cCKB- askBot - Version: ${version}`,
      "font-size: 20px; color:rgb(219, 219, 219); font-weight: bold; background-color:rgb(80, 169, 196); padding: 10px; border-radius: 5px;"
    );
  }, [version]);

  return <></>;
};

export default Version;
