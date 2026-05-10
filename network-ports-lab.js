(function () {
  const SECTION_ID = "network-ports-lab";

  const categories = [
    {
      title: "Web And Application",
      icon: "WEB",
      ports: [
        port("80", "HTTP", ["TCP"], "Unencrypted web traffic and redirects.", "Watch for exposed admin panels, weak headers, injection flaws, and credential leakage over plain HTTP.", "medium"),
        port("443", "HTTPS", ["TCP"], "Encrypted web traffic using TLS.", "Still vulnerable to web app bugs, weak TLS config, expired certificates, and misconfigured reverse proxies.", "medium"),
        port("8080 / 8443", "Alternate Web", ["TCP"], "Common development, proxy, or admin web ports.", "Often forgotten after testing and may expose dashboards, test apps, or default credentials.", "high"),
        port("5000 / 8000 / 3000", "Dev Web Apps", ["TCP"], "Frequent Flask, Django, Node, React, and API dev ports.", "Debug modes, stack traces, and unauthenticated local tools become dangerous when reachable from other hosts.", "high")
      ]
    },
    {
      title: "Name, Addressing, And Time",
      icon: "DNS",
      ports: [
        port("53", "DNS", ["TCP", "UDP"], "Resolves names to addresses. UDP is common; TCP is used for larger replies and zone transfers.", "Misconfigured zone transfers leak records; open resolvers can be abused for amplification.", "medium"),
        port("67 / 68", "DHCP", ["UDP"], "Assigns IP settings to clients.", "Rogue DHCP servers can hand out malicious gateways or DNS servers on a local network.", "medium"),
        port("123", "NTP", ["UDP"], "Synchronizes system clocks.", "Old or open NTP services may support amplification or leak clock/system details.", "medium"),
        port("5353", "mDNS", ["UDP"], "Local name discovery used by printers, media devices, and workstations.", "Can leak hostnames and services on local networks; unnecessary exposure increases discovery noise.", "low")
      ]
    },
    {
      title: "Remote Access",
      icon: "RMT",
      ports: [
        port("22", "SSH", ["TCP"], "Encrypted command-line remote administration.", "Strong when patched and key-based; risky with password login, weak credentials, or public brute-force exposure.", "medium"),
        port("23", "Telnet", ["TCP"], "Legacy clear-text remote shell.", "Credentials and commands are readable on the network. Prefer SSH.", "high"),
        port("3389", "RDP", ["TCP", "UDP"], "Windows remote desktop.", "Public RDP is heavily targeted for brute force, credential stuffing, and unpatched service flaws.", "high"),
        port("5900", "VNC", ["TCP"], "Remote desktop screen sharing.", "Weak passwords, no encryption, and internet exposure can lead to direct desktop compromise.", "high"),
        port("5985 / 5986", "WinRM", ["TCP"], "Windows remote management over HTTP or HTTPS.", "Useful for admins but dangerous when broadly exposed or paired with weak domain credentials.", "high")
      ]
    },
    {
      title: "File Sharing And Transfer",
      icon: "FILE",
      ports: [
        port("20 / 21", "FTP", ["TCP"], "Legacy file transfer control and data channels.", "Plain FTP exposes credentials and data. Prefer SFTP or FTPS.", "high"),
        port("69", "TFTP", ["UDP"], "Simple file transfer without authentication.", "Common for boot images and network gear; should be isolated because it lacks built-in authentication.", "high"),
        port("445", "SMB", ["TCP"], "Windows file sharing and domain services.", "Never expose to the internet; historically targeted by worms and ransomware.", "high"),
        port("137-139", "NetBIOS", ["TCP", "UDP"], "Legacy Windows name and session services.", "Can leak host, share, and domain information; often unnecessary on modern networks.", "medium"),
        port("2049", "NFS", ["TCP", "UDP"], "Unix/Linux network file shares.", "Weak exports can expose sensitive files or allow writes from untrusted hosts.", "high")
      ]
    },
    {
      title: "Email",
      icon: "MAIL",
      ports: [
        port("25", "SMTP", ["TCP"], "Server-to-server mail transfer.", "Open relays can send spam; weak filtering can aid phishing and spoofing.", "medium"),
        port("587", "Submission", ["TCP"], "Authenticated client mail submission.", "Should require authentication and TLS to protect credentials.", "medium"),
        port("465", "SMTPS", ["TCP"], "SMTP over implicit TLS.", "Risk depends on authentication and TLS configuration.", "low"),
        port("110 / 995", "POP3 / POP3S", ["TCP"], "Mailbox retrieval, plain or TLS-protected.", "Plain POP3 exposes credentials; old mailbox protocols may have weak authentication.", "medium"),
        port("143 / 993", "IMAP / IMAPS", ["TCP"], "Mailbox synchronization, plain or TLS-protected.", "Plain IMAP exposes credentials; exposed mailboxes are high-value brute-force targets.", "medium")
      ]
    },
    {
      title: "Identity And Directory",
      icon: "AUTH",
      ports: [
        port("88", "Kerberos", ["TCP", "UDP"], "Domain authentication tickets.", "Misconfigurations and weak passwords can support ticket abuse and offline cracking paths.", "high"),
        port("389 / 636", "LDAP / LDAPS", ["TCP", "UDP"], "Directory lookups and authentication.", "Anonymous binds or plain LDAP can leak directory data or credentials. Prefer LDAPS where appropriate.", "high"),
        port("1812 / 1813", "RADIUS", ["UDP"], "Network access authentication and accounting.", "Weak shared secrets or exposed servers can undermine VPN and Wi-Fi authentication.", "medium"),
        port("1645 / 1646", "Legacy RADIUS", ["UDP"], "Older RADIUS authentication/accounting ports.", "Legacy configs may linger with weak secrets or undocumented firewall rules.", "medium")
      ]
    },
    {
      title: "Databases And Data Stores",
      icon: "DB",
      ports: [
        port("1433", "Microsoft SQL Server", ["TCP"], "Microsoft database service.", "Public databases invite brute force, data theft, and exploitation of unpatched services.", "high"),
        port("1521", "Oracle", ["TCP"], "Oracle database listener.", "Default listeners and weak credentials can expose critical business data.", "high"),
        port("3306", "MySQL / MariaDB", ["TCP"], "Common relational database service.", "Should usually be private; exposed databases are frequent targets for credential attacks.", "high"),
        port("5432", "PostgreSQL", ["TCP"], "Common relational database service.", "Risk rises with public exposure, weak passwords, broad trust rules, or old versions.", "high"),
        port("6379", "Redis", ["TCP"], "In-memory data store and cache.", "Unauthenticated Redis exposed to a network can lead to data theft or code execution paths.", "high"),
        port("27017", "MongoDB", ["TCP"], "Document database service.", "Internet-exposed unauthenticated MongoDB has caused major data leaks.", "high"),
        port("9200", "Elasticsearch", ["TCP"], "Search and analytics API.", "Open clusters can leak indexed data and allow destructive API calls.", "high")
      ]
    },
    {
      title: "Monitoring, Logging, And Admin",
      icon: "OPS",
      ports: [
        port("161 / 162", "SNMP", ["UDP"], "Device monitoring and trap alerts.", "Default community strings can reveal interfaces, routes, hostnames, and device details.", "high"),
        port("514", "Syslog", ["UDP", "TCP"], "Central log forwarding.", "Logs can contain sensitive data; unauthenticated UDP syslog can be spoofed.", "medium"),
        port("623", "IPMI", ["UDP"], "Out-of-band server management.", "Public IPMI is very risky; weak credentials can give hardware-level control.", "high"),
        port("10050 / 10051", "Zabbix", ["TCP"], "Monitoring agent and server ports.", "Exposed monitoring systems can reveal infrastructure and may become a pivot point.", "medium")
      ]
    },
    {
      title: "VPN, Tunneling, And Voice",
      icon: "VPN",
      ports: [
        port("500 / 4500", "IPsec IKE / NAT-T", ["UDP"], "VPN key exchange and NAT traversal.", "Weak pre-shared keys and outdated proposals are common VPN weaknesses.", "medium"),
        port("1194", "OpenVPN", ["TCP", "UDP"], "VPN tunnel service.", "Security depends on certificates, patching, and access controls.", "medium"),
        port("51820", "WireGuard", ["UDP"], "Modern VPN tunnel service.", "Small attack surface, but key handling and firewall scope still matter.", "low"),
        port("1723", "PPTP", ["TCP"], "Legacy VPN control channel.", "PPTP is considered weak and should usually be replaced.", "high"),
        port("5060 / 5061", "SIP / SIPS", ["TCP", "UDP"], "Voice call signaling.", "Exposed SIP can face registration brute force, toll fraud, and enumeration.", "high")
      ]
    },
    {
      title: "Platforms And Containers",
      icon: "CLOUD",
      ports: [
        port("2375 / 2376", "Docker API", ["TCP"], "Docker remote management API.", "Unauthenticated Docker API exposure can give control over containers and host resources.", "high"),
        port("6443", "Kubernetes API", ["TCP"], "Kubernetes control plane API.", "Public access must be tightly authenticated and authorized; misconfigurations can expose clusters.", "high"),
        port("10250", "Kubelet API", ["TCP"], "Kubernetes node agent API.", "Weak or anonymous access can expose pods, logs, and node operations.", "high"),
        port("9092", "Kafka", ["TCP"], "Event streaming broker.", "Exposed brokers can leak messages or allow unauthorized publishing without proper auth.", "high")
      ]
    }
  ];

  const quiz = [
    q("Which statement best describes a network socket?", ["A MAC address plus a VLAN", "An IP address, transport protocol, and port", "A DNS name only", "A cable plugged into a switch"], 1, "A socket is the host address plus transport and port, such as 10.0.0.5:443/tcp."),
    q("Which range is known as well-known ports?", ["0-1023", "1024-49151", "49152-65535", "Any port above 60000"], 0, "Well-known ports cover 0-1023."),
    q("What is the usual purpose of ephemeral ports?", ["Permanent server listening ports", "Temporary client-side source ports", "Only DNS zone transfers", "Only encrypted traffic"], 1, "Clients usually use ephemeral ports as temporary source ports for outbound connections."),
    q("Which service commonly listens on TCP 22?", ["RDP", "SSH", "DNS", "SMTP"], 1, "SSH commonly uses TCP 22."),
    q("Why is Telnet risky?", ["It only works on UDP", "It sends credentials and commands in clear text", "It cannot be scanned", "It uses certificates by default"], 1, "Telnet is a clear-text legacy remote shell."),
    q("Which port is most associated with HTTPS?", ["80/tcp", "443/tcp", "53/udp", "3389/tcp"], 1, "HTTPS normally uses TCP 443."),
    q("Which service should almost never be exposed directly to the internet?", ["SMB on TCP 445", "HTTPS on TCP 443", "NTP on UDP 123", "DNS to an internal resolver"], 0, "SMB has a long history of severe internet-exposure risk."),
    q("DNS commonly uses which protocol and port for normal lookups?", ["TCP 25", "UDP 53", "TCP 3389", "UDP 67"], 1, "DNS lookups commonly use UDP 53, while TCP 53 is also used in specific cases."),
    q("What is a common SNMP weakness?", ["Default or weak community strings", "It only runs encrypted", "It cannot reveal device details", "It replaces SSH"], 0, "Weak SNMP community strings can reveal network and device information."),
    q("Which database commonly uses port 5432?", ["MySQL", "PostgreSQL", "Redis", "MongoDB"], 1, "PostgreSQL commonly listens on TCP 5432."),
    q("What does it mean when a service is listening?", ["It is waiting for inbound traffic on a port", "It has no network exposure", "It is only using outbound DNS", "It is disabled"], 0, "A listening service is ready to accept inbound connections or datagrams."),
    q("Which pairing is the secure replacement idea?", ["Telnet instead of SSH", "HTTP instead of HTTPS", "SFTP or FTPS instead of plain FTP", "PPTP instead of WireGuard"], 2, "SFTP or FTPS avoids the clear-text credential problem of plain FTP.")
  ];

  const state = {
    answered: {},
    correct: 0
  };

  function port(number, name, protocols, use, watch, risk) {
    return { number, name, protocols, use, watch, risk };
  }

  function q(prompt, options, answer, explanation) {
    return { prompt, options, answer, explanation };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function riskLabel(risk) {
    if (risk === "high") {
      return "High Risk If Public";
    }
    if (risk === "medium") {
      return "Needs Controls";
    }
    return "Lower Exposure Risk";
  }

  function renderCategories() {
    const grid = document.getElementById("portsCategoryGrid");
    if (!grid) {
      return;
    }

    grid.innerHTML = categories.map(function (category) {
      const cards = category.ports.map(function (item) {
        return [
          "<article class=\"ports-port-card\">",
          "  <div class=\"ports-port-top\">",
          "    <div>",
          "      <div class=\"ports-port-number\">" + escapeHtml(item.number) + "</div>",
          "      <div class=\"ports-port-name\">" + escapeHtml(item.name) + "</div>",
          "    </div>",
          "    <div class=\"ports-protocols\">" + item.protocols.map(function (protocol) {
            return "<span>" + escapeHtml(protocol) + "</span>";
          }).join("") + "</div>",
          "  </div>",
          "  <p>" + escapeHtml(item.use) + "</p>",
          "  <p class=\"ports-watch\">" + escapeHtml(item.watch) + "</p>",
          "  <span class=\"ports-risk " + escapeHtml(item.risk) + "\">" + escapeHtml(riskLabel(item.risk)) + "</span>",
          "</article>"
        ].join("");
      }).join("");

      return [
        "<section class=\"ports-category\">",
        "  <div class=\"ports-category-head\">",
        "    <span class=\"ports-category-icon\">" + escapeHtml(category.icon) + "</span>",
        "    <h3>" + escapeHtml(category.title) + "</h3>",
        "  </div>",
        "  <div class=\"ports-port-grid\">" + cards + "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function scoreText() {
    return "Score " + state.correct + " / " + quiz.length;
  }

  function persistProgress() {
    if (!window.NetlabApp) {
      return;
    }

    const answeredCount = Object.keys(state.answered).length;
    window.NetlabApp.saveSectionProgress(SECTION_ID, {
      sectionLabel: "Network Ports Lab",
      currentItemId: answeredCount >= quiz.length ? "quiz-complete" : "quiz",
      currentItemLabel: answeredCount >= quiz.length ? "Quiz complete" : "Quiz in progress",
      completedCount: state.correct,
      totalCount: quiz.length,
      summaryText: scoreText(),
      state: {
        answered: state.answered,
        correct: state.correct
      }
    });
  }

  function updateScore() {
    const score = document.getElementById("portsQuizScore");
    if (score) {
      score.textContent = scoreText();
    }
  }

  function handleAnswer(questionIndex, optionIndex) {
    if (state.answered[questionIndex] !== undefined) {
      return;
    }

    const item = quiz[questionIndex];
    const isCorrect = optionIndex === item.answer;
    state.answered[questionIndex] = optionIndex;
    if (isCorrect) {
      state.correct += 1;
    }

    const question = document.querySelector("[data-ports-question=\"" + questionIndex + "\"]");
    if (!question) {
      return;
    }

    question.querySelectorAll(".ports-quiz-option").forEach(function (button, index) {
      button.disabled = true;
      if (index === item.answer) {
        button.classList.add("is-correct");
      } else if (index === optionIndex) {
        button.classList.add("is-wrong");
      }
    });

    const feedback = question.querySelector(".ports-quiz-feedback");
    feedback.textContent = (isCorrect ? "Correct. " : "Not quite. ") + item.explanation;
    feedback.className = "ports-quiz-feedback " + (isCorrect ? "good" : "bad");
    updateScore();
    persistProgress();

    if (window.NetlabApp && isCorrect) {
      window.NetlabApp.grantProgressReward({
        key: "network-ports-quiz:" + questionIndex,
        coins: 2,
        label: "Port Question",
        title: "Port Question",
        tone: "step",
        message: "Answered a network ports question.",
        toast: false
      });
    }
  }

  function renderQuiz() {
    const list = document.getElementById("portsQuizList");
    if (!list) {
      return;
    }

    list.innerHTML = quiz.map(function (item, questionIndex) {
      const options = item.options.map(function (option, optionIndex) {
        return "<button class=\"ports-quiz-option\" type=\"button\" data-option=\"" + optionIndex + "\">" + escapeHtml(option) + "</button>";
      }).join("");

      return [
        "<article class=\"ports-quiz-question\" data-ports-question=\"" + questionIndex + "\">",
        "  <div class=\"ports-quiz-prompt\">" + (questionIndex + 1) + ". " + escapeHtml(item.prompt) + "</div>",
        "  <div class=\"ports-quiz-options\">" + options + "</div>",
        "  <div class=\"ports-quiz-feedback\" aria-live=\"polite\"></div>",
        "</article>"
      ].join("");
    }).join("");

    list.querySelectorAll(".ports-quiz-question").forEach(function (question) {
      const questionIndex = Number(question.getAttribute("data-ports-question"));
      question.querySelectorAll(".ports-quiz-option").forEach(function (button) {
        button.addEventListener("click", function () {
          handleAnswer(questionIndex, Number(button.getAttribute("data-option")));
        });
      });
    });
  }

  function resetQuiz() {
    state.answered = {};
    state.correct = 0;
    renderQuiz();
    updateScore();
    persistProgress();
  }

  function restoreSavedProgress() {
    if (!window.NetlabApp) {
      return;
    }

    const record = window.NetlabApp.getSectionProgress(SECTION_ID);
    const savedState = record && record.state;
    if (!savedState || !savedState.answered) {
      persistProgress();
      return;
    }

    state.answered = savedState.answered || {};
    state.correct = Number(savedState.correct) || 0;
    Object.keys(state.answered).forEach(function (questionIndexText) {
      const questionIndex = Number(questionIndexText);
      const optionIndex = Number(state.answered[questionIndexText]);
      const item = quiz[questionIndex];
      const question = document.querySelector("[data-ports-question=\"" + questionIndex + "\"]");
      if (!item || !question) {
        return;
      }
      question.querySelectorAll(".ports-quiz-option").forEach(function (button, index) {
        button.disabled = true;
        if (index === item.answer) {
          button.classList.add("is-correct");
        } else if (index === optionIndex) {
          button.classList.add("is-wrong");
        }
      });
      const feedback = question.querySelector(".ports-quiz-feedback");
      const isCorrect = optionIndex === item.answer;
      feedback.textContent = (isCorrect ? "Correct. " : "Not quite. ") + item.explanation;
      feedback.className = "ports-quiz-feedback " + (isCorrect ? "good" : "bad");
    });
    updateScore();
  }

  function boot() {
    renderCategories();
    renderQuiz();
    updateScore();

    const resetBtn = document.getElementById("portsResetQuizBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetQuiz);
    }

    if (window.NetlabApp && typeof window.NetlabApp.whenReady === "function") {
      window.NetlabApp.whenReady().then(restoreSavedProgress).catch(function () {
        persistProgress();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
