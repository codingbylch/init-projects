// import '@babel/polyfill'
import "core-js/modules/es.promise";
import axios from "axios";
import answer from "the-answer";

export default function mainProgress(a, b) {
  console.log(a + b);
  test();
  console.log("answer", answer);
  axios.get("https://api.github.com").then((res) => {
    console.log("res", res);
  });
}
