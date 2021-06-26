// import "core-js/modules/es.promise";
import axios from "axios";
import answer from "the-answer";

const mainProgress = (a: number, b: number) => {
    console.log(a + b);
    console.log("answer", answer);
    axios.get("https://api.github.com").then((res) => {
        console.log("res", res);
    });
}
export default mainProgress