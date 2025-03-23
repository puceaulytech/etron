class FriendRequest extends HTMLElement {
    static get observedAttributes() {
        return ["username", "user-id"];
    }

    constructor() {
        super();

        this.template = document.createElement("template");
        this.template.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 12px 0;
        }
        
        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #008000;
          overflow: hidden;
        }
        
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .username {
          font-weight: 600;
          font-size: 16px;
          color: #1c1e21;
        }
        
        .buttons {
          display: flex;
          gap: 8px;
        }
        
        button {
          font-family: inherit;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reject {
          background-color: #f0f2f5;
          color: #65676b;
        }
        
        .reject:hover {
          background-color: #e4e6eb;
        }
        
        .accept {
          background-color: #008000;
          color: white;
        }
        
        .accept:hover {
          background-color: #055205;
        }
      </style>
      
      <div class="container">
        <div class="user-info">
          <div class="avatar"></div>
          <span class="username"></span>
        </div>
        <div class="buttons">
          <button class="reject">Decline</button>
          <button class="accept">Accept</button>
        </div>
      </div>
        `;

        const shadow = this.attachShadow({ mode: "open" });
        shadow.appendChild(this.template.content.cloneNode(true));

        this.usernameSpan = shadow.querySelector(".username");
        this.avatarDiv = shadow.querySelector(".avatar");

        this.usernameSpan.innerText = this.getAttribute("username") ?? "";
        this.avatarDiv.innerText = this.usernameSpan.innerText
            .charAt(0)
            .toUpperCase();

        shadow.querySelector(".reject").addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("rejectFriendRequest", {
                    detail: { userId: this.getAttribute("user-id") ?? "" },
                    bubbles: true,
                    composed: true,
                }),
            );
        });

        shadow.querySelector(".accept").addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("acceptFriendRequest", {
                    detail: { userId: this.getAttribute("user-id") ?? "" },
                    bubbles: true,
                    composed: true,
                }),
            );
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "username") {
            this.usernameSpan.innerText = this.getAttribute("username") ?? "";
            this.avatarDiv.innerText = this.usernameSpan.innerText
                .charAt(0)
                .toUpperCase();
        }
    }
}

customElements.define("friend-request", FriendRequest);
