(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function find(id){return e.scenarios.find(function(s){return s&&s.id===id})}
function add(step,cmd,msg){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push({match:{command:cmd},feedback:msg})}
function patch(id){var s=find(id);if(!s||s.__linuxPolish)return;s.__linuxPolish=true;(s.steps||[]).forEach(function(st){var fam=String(st.commandFamily||'').toLowerCase();var obj=String(st.objective||'').toLowerCase();
if(['nmap','nc','curl','searchsploit','msfconsole','search','use','set','show','run','ehlo','mail','rcpt','data','quit','ss','netstat','grep'].indexOf(fam)>=0){
add(st,'pwd','Good orientation. If you are already in the right place, continue with the next evidence step.');
add(st,'ls','Good discovery. If you already see the target file or output, continue with the next useful command.');
add(st,'cat','Good evidence check. If you already read the right note/output, continue with the next step.');
add(st,'nmap','Good scan evidence. If the service/version is already identified, continue with research, follow-up, or notes.');
add(st,'nc','Good socket evidence. If the banner or port state is already clear, continue with close/verify/notes.');
add(st,'grep','Good filter. If the important line is already found, continue with the next step.');
}
if(['mkdir','touch','cp','mv','tar','unzip','echo','python3','find'].indexOf(fam)>=0){
add(st,'pwd','Good location check. If you are already in the target workspace, continue with the file action.');
add(st,'ls','Good file check. If the target file or folder already exists, continue with verification.');
add(st,'cat','Good verification. If the expected file opens, the task is effectively complete.');
}
if(obj.indexOf('verify')>=0||obj.indexOf('document')>=0||obj.indexOf('note')>=0){
add(st,'ls','Good destination check. If the note already exists, open it to verify.');
add(st,'cat','Good verification. If this opens the expected note, the task is effectively complete.');
}
});}
['nmap-basics-host-check','nmap-basics-web-hypothesis','nmap-basics-save-output','nmap-basics-fast-triage','nmap-basics-full-range-decision','nmap-basics-read-and-follow-up','nmap-basics-udp-hypothesis','nc-basics-smtp-banner-check','nc-basics-web-port-check','nc-basics-listener-callback','nc-basics-file-receiver','nc-basics-file-sender','nc-basics-wrong-port-correction','nc-basics-missing-listener-fix','nc-basics-destination-listens','nc-basics-both-sides-connect-fix','nc-basics-https-socket-check','nc-basics-quiet-service-connect','nc-basics-notes-intake','nc-basics-notes-send','nc-basics-late-listener-recovery','ftp-version-to-research-chain','samba-research-path','metasploit-vsftpd-chain','metasploit-search-and-use','metasploit-target-and-run','smtp-banner-and-session-flow','smtp-full-mail-flow','reverse-listener-preparation','bind-shell-connect','local-bind-service-investigation','challenge-lab-1-web-surface-recon','challenge-lab-2-text-service-hunt','challenge-lab-3-suspicious-access-review','challenge-lab-4-evidence-handoff','proxy-basics-http-connect','proxy-basics-http-request-review','proxy-basics-port-confirmation','proxy-basics-blocked-direct-fallback','proxy-basics-log-filter','proxy-basics-handoff-note','python-scan-workspace-prep','python-setup-and-run','create-a-backup-workspace','copy-a-config-template','move-a-suspicious-log','archive-release-review','asset-bundle-extract','config-bundle-extract','evidence-bundle-extract','rename-an-incident-note'].forEach(patch);
})();