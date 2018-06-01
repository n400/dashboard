import React from "react"

export default () => <div>
  <h2>Welcome to FaunaDB</h2>
  <p>The developer dashboard allows you to browse and create databases, inspect
    and define schemas and instances, and explore your data with the interactive
    query console.</p>
  <h3>Dashboard Quickstart</h3>
  <p>Follow these steps to get comfortable using this dashboard. After each step
    click the Fauna logo in the top-left corner to get back to this list.</p>
  <ol>
    <li>Databases are containers for data. You can create as many databases as
      you like, and they can be nested. Click <strong>Create Database</strong> in
      the sidebar to create one.</li>
    <li>A class is required before you can save data. Each database may
    contain multiple classes. Instances of a class usually have
    common structure, but it's OK for their structure to vary. To create a class,
    navigate via the sidebar to the database you just created, then click <strong>Create Class</strong>.
    You probably want to check the
      "Create Class Index" box on the form.</li>
    <li>Now you are ready to save some data. To create an instance of your class,
    browse to your database, and then select your class in the sidebar. Modify
    the text area so it has more interesting data than an empty {'{}'} and
    click <strong>Create Instance</strong>.</li>
    <li>When you created the class, if you checked "Create Class Index" there will
      also be an index called <code>all_MYCLASS</code>. Click it to browse all the
      instances in the class. Clicking an instance in the result set will reveal
      the history of that instance.</li>
    <li>Last step: pop open the query console by clicking "Toggle Query Console"
      and run the query there which will list your index. Play around with the
      query console with other queries. Here's one to add a field to your instance (you'll want to use the Ref
      listed on the instance you just browsed in the main UI.):
    <pre>
      q.Update(q.Ref(q.Class("myclass"), "159441342217322496"), {'{ data: { foo: "bar" }}'})
    </pre>
  </li>
  </ol>
  <p>Congratulations, you seem to be getting the hang of this. Check out the links
    tutorials and documentation in the header. If you need help, click the chat bubble
    in the lower right, we love feedback.</p>
</div>
