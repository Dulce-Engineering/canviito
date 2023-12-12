import Utils from "../lib/Utils.js";

class Canvas_Code extends HTMLElement 
{
  static tname = "canvas-code";

  constructor()
  {
    super();
    Utils.Bind(this, "On_");
  }

  connectedCallback()
  {
    this.render();
  }

  Hide()
  {
    this.dlg.close();
  }

  Show()
  {
    this.dlg.showModal();
  }

  Gen_Code(shapes)
  {
    let code;

    code = 
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<title>Preview</title>\n" +
      "\t\t<script type=\"module\">\n" +

      "\t\t\tconst canvas = document.getElementById(\"canvas\");\n" +
      "\t\t\tconst ctx = canvas.getContext(\"2d\");\n" +
      "\t\t\tctx.translate(canvas.width/2, canvas.height/2);\n" +
      "\t\t\tctx.strokeStyle=\"#000\";\n" +
      "\t\t\tctx.lineWidth = 2;\n\n" +
  
      this.Gen_Cmds(shapes) +

      "\t\t</script>\n" +
      "\t</head>\n" +
      "\t<body>\n" +
      "\t\t<canvas id=\"canvas\" width=\"1000\" height=\"1000\" style=\"width:100%;height:100%;\">\n" +
      "\t</body>\n" +
      "</html>\n";

    this.txt_area.value = code;
  }

  Gen_Cmds(shapes)
  {
    let res = "";

    if (shapes && shapes.length>0)
    {
      res += "\t\t\tctx.beginPath();\n";
      for (let i=0; i<shapes.length; i++)
      {
        const s = shapes[i];
        res += "\t\t\tctx." + s.To_Cmd_Str() + ";\n";
      }
      res += "\t\t\tctx.stroke();\n";
    }

    return res;
  }

  On_Click_Run()
  {
    const js = this.txt_area.value;
    const page = window.open("", "preview", "width=500,height=500");
    page.document.open();
    page.document.write(js);
    page.document.close();
  }

  On_Click_Close()
  {
    this.Hide();
  }

  render()
  {
    this.innerHTML = `
      <dialog cid="dlg">
        <div class="body">
          <header>
            <h1>Canvas Code</h1>
            <img cid="run_btn" src="images/play-outline.svg">
            <img cid="close_btn" src="images/close.svg">
          </header>
          <textarea cid="txt_area"></textarea>
        </div>
      </dialog>
    `;
    Utils.Set_Id_Shortcuts(this, this, "cid");

    this.run_btn.addEventListener("click", this.On_Click_Run);
    this.close_btn.addEventListener("click", this.On_Click_Close);
  }
}

Utils.Register_Element(Canvas_Code);

export default Canvas_Code;
