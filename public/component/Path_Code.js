import Utils from "../lib/Utils.js";

class Path_Code extends HTMLElement 
{
  static tname = "path-code";

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

  Round(val)
  {
    const dec_places = 3;
    const f = Math.pow(10, dec_places);
    val = Math.trunc(val * f) / f;

    return val;
  }

  Gen_Code(shapes)
  {
    let code;

    code = 
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<title>Plantinator - Sample Page</title>\n" +
      "\t\t<script type=\"module\">\n" +
      "\t\t\timport * as pl from \"./lib/Coral_Racer.js\";\n" +

      "\t\t\tconst canvas = document.getElementById(\"canvas\");\n" +
      "\t\t\tconst ctx = canvas.getContext(\"2d\");\n" +
      "\t\t\tctx.translate(canvas.width/2, canvas.height/2);\n" +
      "\t\t\tctx.scale(1, -1);\n" +
      "\t\t\tctx.strokeStyle=\"#000\";\n" +
      "\t\t\tctx.lineWidth = 1;\n\n" +
  
      this.Gen_Cmds(shapes) +
      "\t\t\tctx.stroke(p);\n" +

      "\t\t</script>\n" +
      "\t</head>\n" +
      "\t<body>\n" +
      "\t\t<canvas id=\"canvas\" width=\"1000\" height=\"1000\" style=\"width:100%;height:100%;\">\n" +
      "\t</body>\n" +
      "</html>\n";

    this.querySelector("#txt_area").value = code;
  }

  Gen_Cmds(shapes)
  {
    let res = "";

    if (shapes && shapes.length>0)
    {
      res += "\t\t\tconst p = new Path2D();\n";
      for (let i=0; i<shapes.length; i++)
      {
        const s = shapes[i];
        res += "\t\t\tp." + s.To_Cmd_Str() + ";\n";
      }
    }

    return res;
  }

  On_Click_Run()
  {
    const js = this.querySelector("#txt_area").value;
    const page = window.open("", "plantinator", "width=500,height=500");
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
    const html = `
      <dialog id="dlg">
        <div id="hdr">
          <div id="title">Path Code</div>
          <div id="btn_bar">
            <button id="run_btn"><img src="images/play-outline.svg"></button>
            <button id="close_btn"><img src="images/close.svg"></button>
          </div>
        </div>
        <textarea id="txt_area"></textarea>
      </dialog>
    `;
    this.innerHTML = html;
    Utils.Set_Id_Shortcuts(this, this);

    this.run_btn.addEventListener("click", this.On_Click_Run);
    this.close_btn.addEventListener("click", this.On_Click_Close);
  }
}

Utils.Register_Element(Path_Code);

export default Path_Code;
