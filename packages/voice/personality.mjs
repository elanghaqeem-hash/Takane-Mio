const styles={neutral:'Clear and respectful',supportive:'Warm and concise',professional:'Formal and structured'};
export function communicationProfile({language='id',style='neutral',reportedMood=null}={}){
 if(!['id','en'].includes(language)||!Object.hasOwn(styles,style)||![null,'calm','happy','sad','frustrated','tired'].includes(reportedMood))throw new TypeError('Invalid communication preference');
 return Object.freeze({identity:'MIO',language,style,guidance:styles[style],reportedMood,moodSource:reportedMood===null?'none':'user-reported',inferredEmotion:null});
}
