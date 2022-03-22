//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
import * as Chatbox from "@alt1/chatbox";
import {$,jQuery} from 'jquery';
//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");


var output = document.getElementById("output");

//loads all images as raw pixel data async, images have to be saved as *.data.png
//this also takes care of metadata headers in the image that make browser load the image
//with slightly wrong colors
//this function is async, so you cant acccess the images instantly but generally takes <20ms
//use `await imgs.promise` if you want to use the images as soon as they are loaded
var imgs = a1lib.ImageDetect.webpackImages({
	homeport: require("./homebutton.data.png")
});

//listen for pasted (ctrl-v) images, usually used in the browser version of an app
a1lib.PasteInput.listen(img => {
	findHomeport(img);
}, (err, errid) => {
	output.insertAdjacentHTML("beforeend", `<div><b>${errid}</b>  ${err}</div>`);
});

//You can reach exports on window.TEST because of
//config.makeUmd("testpackage", "TEST"); in webpack.config.ts
export function capture() {
	if (!window.alt1) {
		output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
		return;
	}
	if (!alt1.permissionPixel) {
		output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);
		return;
	}
	var img = a1lib.captureHoldFullRs();
	findHomeport(img);
}

function findHomeport(img: ImgRef) {
	var loc = img.findSubimage(imgs.homeport);
	output.insertAdjacentHTML("beforeend", `<div>homeport matches: ${JSON.stringify(loc)}</div>`);

	//overlay the result on screen if running in alt1
	if (window.alt1) {
		if (loc.length != 0) {
			alt1.overLayRect(a1lib.mixColor(255, 255, 255), loc[0].x, loc[0].y, imgs.homeport.width, imgs.homeport.height, 2000, 3);
		} else {
			alt1.overLayTextEx("Couldn't find homeport button", a1lib.mixColor(255, 255, 255), 20, Math.round(alt1.rsWidth / 2), 200, 2000, "", true, true);
		}
	}

	//get raw pixels of image and show on screen (used mostly for debug)
	var buf = img.toData(100, 100, 200, 200);
	buf.show();
}

//print text world
//also the worst possible example of how to use global exposed exports as described in webpack.config.json

output.insertAdjacentHTML("beforeend", `
	<div>paste an image of rs with homeport button (or not)</div>
	<div onclick='TEST.capture()'>Click to capture if on alt1 TESTING!!!!!</div>`
	
);
console.log('ran divs')
//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running inside the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
	console.log('Found alt1')
}

var imgref2 = a1lib.capture(100,100,400,400);
var imgref3 = a1lib.capture(-100,-100,-400,-400);
// Retrieve our raw pixel data so we can directly read it
//var imagebuffer = imgref2.buffer

// Show the image by adding it to the DOM (for debugging)
imgref2.show();
imgref3.show();
console.log('Should show two images')


const appColor = a1lib.mixColor(255, 199, 0);
console.log('Grabbing colors')
let reader = new Chatbox.default();
reader.readargs = {
  colors: [
    a1lib.mixColor(255, 255, 255), //White text
    a1lib.mixColor(0, 255, 0), //Green Fortune Text
  ]
  
};
console.log('Read white/green')

// $(".mats").append("<span>Searching for chatboxes</span>");
reader.find();
let findChat = setInterval(function () {
  if (reader.pos === null) reader.find();
  else {
    clearInterval(findChat);
    reader.pos.boxes.map((box, i) => {
      $(".chat").append(`<option value=${i}>Chat ${i}</option>`);
    });

    if (localStorage.archChat) {
      reader.pos.mainbox = reader.pos.boxes[localStorage.archChat];
    } else {
      //If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
      reader.pos.mainbox = reader.pos.boxes[0];
    }
    showSelectedChat(reader.pos);
    
    $("button.tracker").click();
  }
}, 1000);

function showSelectedChat(chat) {
  //Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
  try {
    alt1.overLayRect(
      appColor,
      chat.mainbox.rect.x,
      chat.mainbox.rect.y,
      chat.mainbox.rect.width,
      chat.mainbox.rect.height,
      2000,
      5
    );
  } catch {}
}

function readChatbox() {
  var opts = reader.read() || [];
  var chat = "";
  console.log('read chatbox function')
}


//   let chatParse = chat.split(/\d+:?|\[|\]/g);
//   chatParse.forEach((item) => {
//     // Start of a chat "buffer", to prevent extra chat reads.
//     // let date = new Date();
//     // let chatTime = "";
//     // let curTime = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${
//     //   (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
//     // }:${(date.getSeconds() < 10 ? "0" : "") + date.getSeconds()}`;
//     // let curTimeSeconds = `${(date.getSeconds() < 10 ? "0" : "") + date.getSeconds()}`;
//     // if (chat.match(/\d*:\d*:\d*/)) chatTime = chat.match(/\d*:\d*:\d*/)[0];
//     // if (chatTime !== curTime)
//     //   return console.log("Found old chat, skipping", chatTime, curTime);

//     if (item.trim() === "") return;
//     let name, type;
//     if (item.indexOf("Your Magic skullball (c") > -1) {
//       name = item
//         .trim()
//         .split("Your Magic skullball (colours) says ")[1]
//         .trim()
//         .replace(/(\.|')/g, "");
//       type = "colours";
//     } else if (item.indexOf("Your Magic skullball (y") > -1) {
//       //Check if material storage is in the same chat line, if it is, skip this output
//      // if (chat.indexOf("material storage") > -1) return;
//       name = item
//         .trim()
//         .split("Your Magic skullball (yes/no) says  ")[1]
//         .trim()
//         .replace(/(\.|')/g, "");
//       type = "yesNO";
//     } else {
//       if (chat.length > 0)
//         console.log({ chat: chat, item: item, error: "No result found" });
//       return;
//     }
//     console.log({
//       chat: chat,
//       item: item,
//       name: name,
//       type: type,
//     });
//     materials.forEach((mat) => {
//       if (mat.name.replace("'", "") === name) {
//         mat.qty++;
//         tidyTable(name);
//       }
//     });
//   });
// }