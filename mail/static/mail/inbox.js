document.addEventListener('DOMContentLoaded', function () {

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener('submit', () => send_email());

  load_mailbox('inbox');

});

function compose_email() {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
          console.log(emails);

          let emails_view = document.querySelector("#emails-view");
          let table = document.createElement("table");

          if (emails.length > 0) {
              for (let i = 0; i < emails.length; i++) {

                  let email = emails[i];
                  let tr = document.createElement("tr");

                  let td1 = document.createElement("td");
                  let td2 = document.createElement("td");
                  let td3 = document.createElement("td");

                  if (!email.read)
                      tr.style.backgroundColor = "lightgrey"

                  td1.className = "eml";
                  td2.className = "subj";
                  td3.className = "times";

                  td1.textContent = email.sender;
                  td2.textContent = email.subject;
                  td3.textContent = email.timestamp;

                  tr.appendChild(td1);
                  tr.appendChild(td2);
                  tr.appendChild(td3);

                  tr.addEventListener("click", () => {
                      display_mail(email.id, mailbox);
                  });

                  table.appendChild(tr);
                  table.className = "border-spacing-20px-15px";
                  emails_view.appendChild(table);
              }
          }
      });
}

function display_mail(id, mailbox) {

  let emails_view = document.querySelector('#emails-view');
  emails_view.innerHTML = '';
  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {

          let data = document.createElement("div");
          data.innerHTML = `
      <strong>From:</strong> ${email.sender}<br>
      <strong>To:</strong> ${email.recipients}<br>
      <strong>Subject:</strong> ${email.subject}<br>
      <strong>Timestamp:</strong> ${email.timestamp}<br>`;

          let replyButton = document.createElement("btn");
          let archiveButton = document.createElement("btn");

          replyButton.className = `btn btn-sm btn-outline-primary`;
          archiveButton.className = `btn btn-sm btn-outline-primary`;

          replyButton.innerText = 'Reply';

          if (email.archived)
              archiveButton.innerText = 'UnArchive';
          else
              archiveButton.innerText = 'Archive';

          archiveButton.addEventListener("click", () => {
              if (archiveButton.innerText === 'Archive')
                  archiveButton.innerText = 'UnArchive';
              else
                  archiveButton.innerText = 'Archive';

              fetch(`/emails/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: !email.archived
                  })
              })
          });

          fetch(`/emails/${id}`, {  
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
          })

          replyButton.addEventListener("click", () => {
              compose_email();
              document.querySelector('#compose-recipients').value = email.sender;
              document.querySelector('#compose-subject').value = 'Re:' + email.subject;
              document.querySelector('#compose-body').value = `\n===============================================\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;

          });

          emails_view.appendChild(data);

          if (mailbox !== 'sent')  
              emails_view.appendChild(archiveButton);
          emails_view.appendChild(replyButton);


          let body = document.createElement("hr");

         body.innerText = `${email.body}`;
          console.log(body);
          emails_view.append(body);

      });
}

function send_email() {
  alert('sent');

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value,
          read: false
      })
  }).then(response => response.json())
      .then(result => {
          console.log(result);
          load_mailbox('sent');
      })
}