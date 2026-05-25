(function(){
  const devices = [
    ['SALES-PC01','sales','PC',11,15],['SALES-PC02','sales','PC',15,24],['SALES-LAPTOP','sales','LT',8,33],['SALES-PRN','sales','PRN',18,40],['SALES-PHONE','sales','PH',6,23],
    ['ACC-PC01','accounts','PC',72,15],['ACC-PC02','accounts','PC',78,24],['PAYROLL-PC','accounts','PAY',82,34],['NAS-ACCOUNTS','accounts','NAS',74,40],['ACC-PRN','accounts','PRN',88,18],
    ['RECEPTION-PC','reception','PC',7,62],['FRONT-PRN','reception','PRN',16,66],['LOBBY-AP','reception','AP',11,76],['KIOSK-01','reception','KSK',22,76],
    ['WAREHOUSE-PC','warehouse','PC',76,63],['SCANNER-01','warehouse','SCAN',84,70],['LABEL-PRN','warehouse','PRN',70,77],['PICKER-TAB','warehouse','TAB',88,80],
    ['DNS01','infra','DNS',44,22],['DHCP01','infra','DHCP',52,22],['MONITOR01','infra','MON',48,76],['AP-STAFF','infra','AP',56,76],['PATCH-SRV','infra','SRV',47,13],
    ['CAM-01','iot','CAM',27,10],['CAM-02','iot','CAM',64,10],['DOOR-CTRL','iot','DOOR',31,84],['OLD-NAS','iot','NAS',61,84],['THERMO-01','iot','SEN',36,9],['TV-BOARD','iot','TV',67,85]
  ];
  const zones = [
    ['SALES','ppr-office-zone-sales'],['ACCOUNTS','ppr-office-zone-accounts'],['RECEPTION','ppr-office-zone-reception'],['WAREHOUSE','ppr-office-zone-warehouse'],['IT / INFRA','ppr-office-zone-it']
  ];
  function addOfficeDevices(){
    const map = document.getElementById('pprMap');
    if(!map || map.querySelector('.ppr-office-device')) return;
    zones.forEach(function(item){
      const z = document.createElement('div');
      z.className = 'ppr-office-zone-label ' + item[1];
      z.textContent = item[0];
      map.appendChild(z);
    });
    devices.forEach(function(item, index){
      const d = document.createElement('div');
      d.className = 'ppr-office-device ppr-office-' + item[1] + (index % 3 === 0 ? ' ppr-office-faded' : '');
      d.style.left = item[3] + '%';
      d.style.top = item[4] + '%';
      d.innerHTML = '<span>' + item[2] + '</span><small>' + item[0] + '</small>';
      map.appendChild(d);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addOfficeDevices, {once:true});
  else addOfficeDevices();
})();