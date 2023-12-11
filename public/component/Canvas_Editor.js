import "./Remote_Ctrl.js";
import * as pl from "../lib/Shapes.js";
import Utils from "../lib/Utils.js";

// Editor Def ======================================================================================

class Canvas_Editor extends HTMLElement
{
  static tname = "canvas-editor";

  constructor()
  {
    super();
    this.cmd = null;
    this.on_change_fn = null;
    this.paint_style = "stroke";
    this.shapes = null;
    Utils.Bind(this, "On_");
  }
  
  connectedCallback()
  {
    this.Render();
  }

  Init_Canvas(zoom, width, height, line_width)
  {
    this.ctx.zoom = zoom;
    this.ctx.line_width = 1/zoom;

    this.canvas.width = width;
    this.canvas.height = height;        
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.strokeStyle="#fff";
    this.ctx.fillStyle="#fff";

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!this.ctx.trn)
    {
      this.ctx.trn = { x: this.canvas.width/2, y: this.canvas.height/2};
    }
    this.ctx.translate(this.ctx.trn.x, this.ctx.trn.y);
    this.ctx.scl = { x: zoom, y: zoom};
    this.ctx.scale(this.ctx.scl.x, this.ctx.scl.y);
  }

  Set_Transform(trn, scl)
  {
    if (trn)
    {
      this.ctx.trn = trn;
    }
    if (scl)
    {
      this.ctx.scl = scl;
    }

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.ctx.trn.x, this.ctx.trn.y);
    this.ctx.scale(this.ctx.scl.x, this.ctx.scl.y);
  }

  Disable_Events()
  {
    this.canvas.removeEventListener('mousemove', this.On_MouseMove_Canvas);
    this.canvas.removeEventListener('mousedown', this.On_MouseDown_Canvas);
    this.canvas.removeEventListener('mouseup', this.On_MouseUp_Canvas);
  }

  Enable_Events()
  {
    this.canvas.addEventListener('mousemove', this.On_MouseMove_Canvas);
    this.canvas.addEventListener('mousedown', this.On_MouseDown_Canvas);
    this.canvas.addEventListener('mouseup', this.On_MouseUp_Canvas);
  }

  Set_Shapes(shapes)
  {
    this.shapes = shapes;
    this.remote_ctrl.Set_Shapes(shapes);

    this.On_Render(this.ctx, shapes);
  }

  Set_Zoom_2(zoom, screen_x, screen_y)
  {
    let pt;

    pt = pl.To_Canvas_Pt(this.ctx, screen_x, screen_y);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-pt.x, -pt.y);

    const p2 = pl.To_Canvas_Pt(this.ctx, screen_x, screen_y);
    this.ctx.translate(p2.x, p2.y);
    this.ctx.translate(-pt.x, -pt.y);
    
    this.ctx.zoom = zoom;
    this.ctx.line_width = 2/zoom;
    this.ctx.scl = { x: zoom, y: zoom};
    this.ctx.trn = pl.To_Canvas_Pt(this.ctx, this.ctx.canvas.width/2, this.ctx.canvas.height/2);

    this.Update();
  }

  Set_Paint(paint_style)
  {
    this.stroke.classList.remove("selected");
    this.fill.classList.remove("selected");
    if (paint_style=="stroke") this.stroke.classList.add("selected");
    else if (paint_style=="fill") this.fill.classList.add("selected");

    this.paint_style = paint_style;
    this.On_Render(this.ctx, this.shapes);
  }

  Resize(width, height)
  {
    this.style.width = width + "px";
    this.style.height = height + "px";
    this.Init_Canvas(this.ctx.zoom, width, height, this.ctx.line_width);
    this.On_Render(this.ctx, this.shapes);
  }

  Update()
  {
    this.On_Render(this.ctx, this.shapes);
  }

  // Events =======================================================================================

  On_Remote_Click(shape)
  {
    this.Update();
    if (this.on_change_fn)
    {
      this.on_change_fn(shape);
    }
  }

  On_MouseMove_Canvas(event)
  {
    let shape;

    if (this.cmd && this.cmd.id == "pan")
    {
      const dx = event.offsetX - this.cmd.x;
      const dy = event.offsetY - this.cmd.y;
      
      const c_pt = { x: this.cmd.o.x + dx, y: this.cmd.o.y + dy };
      this.Set_Transform(c_pt, null);
      this.Update();
    }
    else if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        if (shape.On_Mouse_Move)
        {
          shape.On_Mouse_Move(event, this.ctx);
        }
      }
      this.Update();
    }
  }

  On_MouseDown_Canvas(event)
  {
    let shape, hit = false;

    if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        if (shape.On_Mouse_Down)
        {
          hit = hit || shape.On_Mouse_Down(event, this.ctx);
        }
      }
    }

    if (!hit)
    {
      this.cmd = { id: "pan", x: event.offsetX, y: event.offsetY, o: pl.To_Screen_Pt(this.ctx, 0, 0) };
    }

    if (hit)
    {
      this.Update();
    }
  }

  On_MouseUp_Canvas(event)
  {
    let shape, has_change;

    if (this.cmd)
    {
      this.cmd = null;
    }
    else if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        if (shape.On_Mouse_Up)
        {
          has_change = shape.On_Mouse_Up(event, this.ctx);
          if (has_change && this.on_change_fn)
          {
            this.on_change_fn(shape);
          }
        }
        this.Update();
      }
    }
  }

  On_Click_Stroke(event)
  {
    this.Set_Paint("stroke");
  }

  On_Click_Fill(event)
  {
    this.Set_Paint("fill");
  }

  On_Click_Zoom_In(event)
  {
    this.Set_Zoom_2(this.ctx.zoom*1.5);
  }

  On_Click_Zoom_Out(event)
  {
    this.Set_Zoom_2(this.ctx.zoom/1.5);
  }

  On_Click_Show_Remote()
  {
    this.remote_ctrl.Show();
  }

  On_Wheel(event)
  {
    if (event.deltaY>0)
    {
      this.Set_Zoom_2(this.ctx.zoom/1.5, event.clientX, event.clientY);
    }
    else
    {
      this.Set_Zoom_2(this.ctx.zoom*1.5, event.clientX, event.clientY);
    }
  }

  // Gfx ==========================================================================================
  
  Clr(ctx)
  {
    const p1 = pl.To_Canvas_Pt(ctx, 0, 0);
    const p2 = pl.To_Canvas_Pt(ctx, ctx.canvas.width, ctx.canvas.height);
    ctx.clearRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
  }

  On_Render(ctx, shapes)
  {
  }

  Render_Origin(ctx)
  {
    ctx.save();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = ctx.line_width;

    const p1 = pl.To_Canvas_Pt(ctx, 0, 0);
    const p2 = pl.To_Canvas_Pt(ctx, ctx.canvas.width, ctx.canvas.height);
    
    ctx.beginPath();
    ctx.moveTo(p1.x, 0);
    ctx.lineTo(p2.x, 0);
    ctx.moveTo(0, p1.y);
    ctx.lineTo(0, p2.y);
    ctx.stroke();

    ctx.restore();
  }

  Render()
  {
    this.innerHTML = `
      <div id="btn_bar">
        <button id="remote_btn" title="Show Remote Control"><img src="images/remote.svg"></button>

        &#183; 
        <button id="zoom_in_btn" title="Zoom In"><img src="images/magnify-plus-outline.svg"></button>
        <button id="zoom_out_btn" title="Zoom Out"><img src="images/magnify-minus-outline.svg"></button>

        &#183; <button id="stroke" title="Stroke"><img src="images/pentagon-outline.svg"></button>
        <button id="fill" title="Fill"><img src="images/pentagon.svg"></button>
      </div>

      <canvas id="canvas" width="1000" height="1000"></canvas>

      <remote-ctrl id="remote_ctrl"></remote-ctrl>
    `;

    Utils.Set_Id_Shortcuts(this, this);

    this.canvas.addEventListener("wheel", this.On_Wheel);
    this.stroke.addEventListener("click", this.On_Click_Stroke);
    this.zoom_out_btn.addEventListener("click", this.On_Click_Zoom_Out);
    this.zoom_in_btn.addEventListener("click", this.On_Click_Zoom_In);
    this.remote_btn.addEventListener("click", this.On_Click_Show_Remote);
    this.fill.addEventListener("click", this.On_Click_Fill);
    this.remote_ctrl.on_change_fn = this.On_Remote_Click;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.globalCompositeOperation = "lighter";
    this.Init_Canvas(1, this.canvas.width, this.canvas.height, 1);
    this.Set_Paint("stroke");
    this.Enable_Events();
  }
}

Utils.Register_Element(Canvas_Editor);

export default Canvas_Editor;