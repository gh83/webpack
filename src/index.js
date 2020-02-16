import './styles/styles.css';
console.log(1);

async function start(){
    return await Promise.resolve('async is worck')
}

const x =1;

start().then(console.log)