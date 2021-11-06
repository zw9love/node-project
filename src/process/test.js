/**
 @author zengwei
 @time 2021/11/6
 **/

// 打印当前线程id
console.log(`child pid is ${process.pid}`);

// 接收父线程信息
process.on("message",(msg) => {
  console.log(`[child] get a data from parent is ${msg}\n`);
  process.send(`hello parent`);
});
