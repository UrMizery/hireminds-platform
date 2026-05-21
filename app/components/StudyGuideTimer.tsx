"use client";

import {useEffect,useState} from "react";

export default function StudyGuideTimer({
module,
completionKey,
requiredSeconds=30
}:{
module:string;
completionKey:string;
requiredSeconds?:number
}){

const [seconds,setSeconds]=
useState(0);

useEffect(()=>{

localStorage.removeItem(
completionKey
);

const timer=
setInterval(()=>{

setSeconds(prev=>{

const next=prev+1;

if(
next>=requiredSeconds
){

localStorage.setItem(
completionKey,
"true"
);

clearInterval(timer);

return requiredSeconds;
}

return next;

})

},1000);

return()=>{

clearInterval(timer);

localStorage.removeItem(
completionKey
);

};

},[]);

return(

<div>

<h3>

{seconds>=requiredSeconds
?"Completed ✅"
:`0:${String(
requiredSeconds-seconds
).padStart(2,"0")}`}

</h3>

</div>

)

}
