(function(){
  const graph={
    'YOUR-PC':['ACCESS-SW'],
    'ACCESS-SW':['YOUR-PC','ROUTER-A','SALES-01','SALES-02','SALES-PRN','RECEPTION','LOBBY-AP'],
    'ROUTER-A':['ACCESS-SW','CORE-SW','DNS01','DHCP01','WEB-DMZ','ARCHIVE'],
    'CORE-SW':['ROUTER-A','FIREWALL','ACCOUNTS-PC','WAREHOUSE-PC','PACKET-LOSS'],
    'FIREWALL':['CORE-SW','VAULT-GATE'],
    'VAULT-GATE':['FIREWALL','FILESERV','DOOR-CTRL'],
    'FILESERV':['VAULT-GATE'],
    'SALES-01':['ACCESS-SW'],
    'SALES-02':['ACCESS-SW'],
    'SALES-PRN':['ACCESS-SW'],
    'RECEPTION':['ACCESS-SW'],
    'LOBBY-AP':['ACCESS-SW','KIOSK'],
    'KIOSK':['LOBBY-AP'],
    'DNS01':['ROUTER-A'],
    'DHCP01':['ROUTER-A'],
    'WEB-DMZ':['ROUTER-A'],
    'ARCHIVE':['ROUTER-A'],
    'ACCOUNTS-PC':['CORE-SW','NAS-ACCOUNTS'],
    'NAS-ACCOUNTS':['ACCOUNTS-PC','PAYROLL','BACKUP-NAS'],
    'PAYROLL':['NAS-ACCOUNTS'],
    'BACKUP-NAS':['NAS-ACCOUNTS'],
    'WAREHOUSE-PC':['CORE-SW','SCANNER'],
    'SCANNER':['WAREHOUSE-PC','LABEL-PRN'],
    'LABEL-PRN':['SCANNER'],
    'PACKET-LOSS':['CORE-SW','MONITOR01'],
    'MONITOR01':['PACKET-LOSS'],
    'DOOR-CTRL':['VAULT-GATE']
  };
  const ipData={
    'YOUR-PC':['10.10.5.23','255.255.255.0','10.10.5.1','Office workstation'],
    'ACCESS-SW':['10.10.5.1','255.255.255.0','10.10.5.254','LAN access switch/gateway'],
    'ROUTER-A':['10.10.5.254','255.255.255.0','10.20.0.1','Router to core network'],
    'CORE-SW':['10.20.0.1','255.255.255.0','10.20.7.1','Core switch'],
    'FIREWALL':['10.20.0.254','255.255.255.0','10.20.7.1','Firewall between core and secure servers'],
    'VAULT-GATE':['10.20.7.1','255.255.255.0','10.20.7.15','Secure server gateway'],
    'FILESERV':['10.20.7.15','255.255.255.0','10.20.7.1','Target file server']
  };
  const edgeList=[['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']];
  // Backup note: this file captures the state before converting the mobile command builder into a bottom sheet.
})();