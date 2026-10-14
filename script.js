// SMART HOTEL TABLE ALLOCATOR - GNU SIM 8085 LOGIC IN JS
// Memory Map same as GNU Assembly
let tableMemory = [0,1,0,0,1,0]; // 2000H-2005H : 0=Free, 1=Booked
let hlReg = null; // 2050H - Selected Table
let spCount = 0; // 2300H - SP Count
let totalBill = 0; // 2200H - Bill
let zFlag = 0; // 2301H - Booking Status
let foodStack = []; // 2100H - Food Stack
let spReg = 0x2110; // SP Register

function renderTables(){
  let html='';
  tableMemory.forEach((status,i)=>{
    let cls = status==1? 'booked' : 'free';
    if(hlReg==i) cls+=' sel';
    let text = status==1? 'BOOKED' : 'FREE';
    html+=`<div class="table ${cls}" onclick="bookTable(${i})">T0${i+1}<br><small>${text}</small></div>`;
  });
  document.getElementById('tables').innerHTML=html;
  updateRegisters();
}

function updateRegisters(){
  document.getElementById('hl').innerText = hlReg!=null? `T0${hlReg+1} (0x200${hlReg}H)` : '--';
  document.getElementById('spc').innerText = spCount;
  document.getElementById('bill').innerText = totalBill;
  document.getElementById('total').innerText = totalBill;
  document.getElementById('cart-sp').innerText = spCount;
  document.getElementById('z').innerText = zFlag;
  document.getElementById('sp-reg').innerText = spReg.toString(16).toUpperCase() + 'H';

  let cartHtml = foodStack.length? foodStack.map(f=>`> PUSH ${f.name} | Code=0${f.code}H | Price=${f.price} | SP=000${spCount}H`).join('<br>') : 'Cart Empty - PUSH to Add';
  document.getElementById('cart-list').innerHTML=cartHtml;
}

function log(msg){
  let con = document.getElementById('console');
  con.innerHTML+=`> ${msg}<br>`;
  con.scrollTop = con.scrollHeight;
}

function bookTable(id){
  // GNU Logic: MOV A,M / CPI 01H / JZ BOOK_FAIL
  if(tableMemory[id]==1){
    log(`CALL T0${id+1} - FAIL | MOV A,M=01H | CPI 01H | JZ BOOK_FAIL | Z=0 | Already BOOKED`);
    zFlag=0;
    updateRegisters();
    return;
  }
  // MVI M,01H - Book it
  tableMemory[id]=1;
  hlReg=id;
  zFlag=1;
  document.getElementById('acc').innerText='01H';
  document.getElementById('pc').innerText=`200${id}H`;
  log(`CALL T0${id+1} - Allocation Success | LXI H,2000H | ADD L | MOV L,A | MVI M,01H | STA 2050H | HL=T0${id+1} | ACC=RESERVED | Z=1`);
  renderTables();
}

function order(code,name,price){
  if(hlReg==null){
    alert('Pehle Table Book Karo! CALL Operation karo - Table select karo');
    return;
  }
  // GNU Logic: PUSH B / INR C / STA 2300H / ADI
  foodStack.push({code,name,price});
  spCount++;
  totalBill+=price;
  spReg = 0x2110 - spCount; // SP decrements on PUSH in 8085

  let adiHex = price.toString(16).toUpperCase() + 'H';
  log(`PUSH ${name} | Code=0${code}H | PUSH B | INR C | STA 2300H | LXI H,2200H | ADI ${adiHex} | MEM[2100H] | SP=000${spCount}H | Bill=${totalBill}`);
  updateRegisters();
}

function hlt(){
  if(spCount==0){
    alert('Cart Khali Hai! PUSH Operation se food add karo');
    return;
  }
  log(`HLT - Order Placed | Total SP=${spCount} | Bill Rs ${totalBill} | Z=1 | STA 2200H | HALT | Order Success`);
  alert(`ORDER PLACED!\nTable: T0${hlReg+1} (HL=0x2050H)\nTotal Items (SP 2300H): ${spCount}\nTotal Bill (2200H): Rs ${totalBill}\nZ Flag (2301H): 1 Success\n\nGNU Memory:\n2000H: ${tableMemory.join(' ')}\n2050H: 0${hlReg}H\n2300H: 0${spCount}H\n2200H: ${totalBill} Rs`);
}

// Init
renderTables();
log('LXI SP,2110H - Food Stack Initialized');
log('LXI H,2000H - Table Memory [00 01 00 00 01 00] Loaded');
