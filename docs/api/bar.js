export function loadBar(level) {
  const style = `
    <style>
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 24px;
        border-bottom: 1px solid #2a2f3a;
        background: #0f1115;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: white;
        font-weight: 600;
      }

      .logo img {
        width: 28px;
        height: 28px;
      }

      .nav-right {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .btn {
        background: transparent;
        border: 1px solid #2a2f3a;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
      }

      .btn:hover {
        border-color: #888;
      }

      .profile {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid #2a2f3a;
        cursor: pointer;
      }
    </style>
  `;

  const sessionId = sessionStorage.getItem("session-id");

  const html = sessionId
    ? `
    <div class="navbar">
      <a class="logo" href="${level}/home">
        <img src="https://aiincer.github.io/chess/src/img/logo.png" alt="Logo" />
        Chess
      </a>

      <div class="nav-right">
        <button class="btn" onclick="location.href='${level}/profile/skins'">
          Skins
        </button>
        <button class="btn" onclick="location.href='${level}/profile/friends'">
          Freunde
        </button>
        <img 
          class="profile" 
          src="https://aiincer.github.io/chess/src/img/profile.png" 
          alt="Profile"
          onclick="location.href='${level}/profile'"
        />
      </div>
    </div>
  `
    : `
    <div class="navbar">
      <a class="logo" href="${level}/">
        <img src="https://aiincer.github.io/chess/src/img/logo.png" alt="Logo" />
        Chess
      </a>

      <div class="nav-right">
        <button class="btn" onclick="location.href='${level}/login'">
          Login
        </button>
        <button class="btn" onclick="location.href='${level}/signup'">
          Signup
        </button>
      </div>
    </div>
  `;

  return style + html;
}
