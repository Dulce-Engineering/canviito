
// Shapes =========================================================================================

export class Shape
{
  constructor()
  {
    this.class_name = "Shape";
    this.Init_Shape();
    this.pt = this.New_Btn_Path("pt", 0, 0);
    this.def_stroke_style = "#000";
  }

  Init_Shape()
  {
    this.class_name = "Shape";
    this.name = "shape";
    this.selected = false;
    this.cmd = null;
    this.btns = [];
    this.prev_shape = null;
    this.pt = null;
  }

  New_Btn_Path(id, x, y)
  {
    const r = 5;
    const p = new Path2D();
    p.moveTo(-r, -r);
    p.lineTo(-r, r);
    p.lineTo(r, r);
    p.lineTo(r, -r);
    p.closePath();
    p.hover = false;
    p.id = id;
    p.x = x;
    p.y = y;
    this.btns.push(p);

    return p;
  }

  Pt_Translate(pt, ptd)
  {
    pt.x += ptd.x;
    pt.y += ptd.y;
  }

  Pt_Scale(pt, pts)
  {
    pt.x = pt.x * pts.x;
    pt.y = pt.y * pts.y;
  }

  Pt_Difference(pta, ptb)
  {
    const x = pta.x-ptb.x;
    const y = pta.y-ptb.y;
    return {x, y};
  }

  Params_Str()
  {
    let res = "";

    if (this.pt)
    {
      res = "x = "+Round(this.pt.x)+", y = "+Round(this.pt.y);
    }

    return res;
  }

  To_Cmd_Str()
  {
    let params = "";
    const s = ", ";
    const x = this.pt.x;
    const y = this.pt.y;

    params = Append_Str(params, x, s);
    params = Append_Str(params, y, s);

    return "moveTo("+params+")";
  }

  On_Mouse_Up(event, ctx)
  {
    let res = false;

    if (this.cmd)
    {
      this.cmd = null;
      res = true;
    }

    return res;
  }

  On_Mouse_Move(event, ctx)
  {
    let res = false;

    if (this.cmd)
    {
      const c_pt = To_Canvas_Pt(ctx, event.offsetX, event.offsetY);
      this.On_Mouse_Move_Cmd(ctx, c_pt, this.cmd);
    }
    else if (this.selected)
    {
      for (let i=0; i<this.btns.length; i++)
      {
        res = res || this.On_Mouse_Move_Btn(ctx, event, this.btns[i]);
      }
    }

    return res;
  }

  On_Mouse_Move_Cmd(ctx, c_pt, cmd)
  {
    cmd.x = c_pt.x;
    cmd.y = c_pt.y;
}

  On_Mouse_Move_Btn(ctx, event, path)
  {
    let res = false;

    ctx.save();
    ctx.translate(path.x, path.y);
    
    // undo ctx scale
    ctx.scale(1/ctx.scl.x, 1/ctx.scl.y);

    const is_in_path = ctx.isPointInPath(path, event.offsetX, event.offsetY);
    if (path.hover != is_in_path)
    {
      path.hover = is_in_path;
      res = true;
    }
    ctx.restore();

    return res;
  }

  On_Mouse_Down(event, ctx)
  {
    let res = false;

    if (this.selected)
    {
      for (let i=0; i<this.btns.length; i++)
      {
        if (this.btns[i].hover)
        {
          this.cmd = this.btns[i];
          res = true;
          break;
        }
      }
    }

    return res;
  }

  Render(ctx)
  {
    if (this.selected)
    {
      for (let i=0; i<this.btns.length; i++)
      {
        this.Render_Btn(ctx, this.btns[i]);
      }
    }
    ctx.strokeStyle = this.def_stroke_style;
  }

  Render_Btn(ctx, path)
  {
    ctx.save();
    ctx.translate(path.x, path.y);
    //ctx.scale(1/this.scale.x, 1/this.scale.y);

    // undo ctx scale
    ctx.scale(1/ctx.scl.x, 1/ctx.scl.y);

    if (path.hover)
    {
      ctx.fillStyle = "#0f0";
    }
    else
    {
      ctx.fillStyle = "deeppink";
    }
    ctx.fill(path);

    ctx.restore();
  }

  Get_Pos()
  {
    let pos = null;

    if (this.btns && this.btns.length > 0)
    {
      pos = 
      {
        x: this.btns[0].x,
        y: this.btns[0].y
      };
    }

    return pos;
  }

  Set_Pos(new_pos)
  {
    if (this.btns)
    {
      if (this.btns.length>1)
      {
        const o_pos = this.Get_Pos();
        for (let i=1; i<this.btns.length; i++)
        {
          const curr_pt = this.btns[i];
          const d_pt = this.Pt_Difference(curr_pt, o_pos);

          curr_pt.x = new_pos.x;
          curr_pt.y = new_pos.y;
          this.Pt_Translate(curr_pt, d_pt);
        }
      }
      this.btns[0].x = new_pos.x;
      this.btns[0].y = new_pos.y;
    }
  }
}

export class Shape_Arc extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_Arc";
    this.cp = this.New_Btn_Path("cp", 100, 100);
    this.sa = this.New_Btn_Path("sa", 100, 0);
    this.ea = this.New_Btn_Path("ea", -120, 0);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "x = "+Round(this.pt.x), s);
    res = Append_Str(res, "y = "+Round(this.pt.y), s);
    res = Append_Str(res, "radius = "+Round(this.Calc_Radius()), s);
    res = Append_Str(res, "startAngle = "+Round(this.Calc_Start_Angle()), s);
    res = Append_Str(res, "endAngle = "+Round(this.Calc_End_Angle()), s);

    return res;
  }

  Set_Radius(r)
  {
    this.cp.x = this.pt.x + r;
    this.cp.y = this.pt.y + r;
  }

  Calc_Radius()
  {
    let r = 0;
    const ptc = this.Pt_Difference(this.cp, this.pt);
    if (Math.abs(ptc.x)<Math.abs(ptc.y))
    {
      r = Math.abs(ptc.x);
    }
    else
    {
      r = Math.abs(ptc.y);
    }

    return r;
  }

  Set_Start_Angle(a)
  {
    const r = this.Calc_Radius() + 20;
    this.sa.x = this.pt.x + Math.cos(a)*r;
    this.sa.y = this.pt.y + Math.sin(a)*r;
  }

  Calc_Start_Angle()
  {
    const pta = this.Pt_Difference(this.sa, this.pt);
    return Math.atan2(pta.y, pta.x);
  }

  Set_End_Angle(a)
  {
    const r = this.Calc_Radius() + 40;
    this.ea.x = this.pt.x + Math.cos(a)*r;
    this.ea.y = this.pt.y + Math.sin(a)*r;
  }

  Calc_End_Angle()
  {
    const ptb = this.Pt_Difference(this.ea, this.pt);
    return Math.atan2(ptb.y, ptb.x);
  }

  To_Cmd_Str()
  {
    const s = ", ";
    const x = this.pt.x;
    const y = this.pt.y;
    const radius = this.Calc_Radius();
    const startAngle = this.Calc_Start_Angle();
    const endAngle = this.Calc_End_Angle();
    let params;

    params = Append_Str(params, x, s);
    params = Append_Str(params, y, s);
    params = Append_Str(params, radius, s);
    params = Append_Str(params, startAngle, s);
    params = Append_Str(params, endAngle, s);

    return "arc("+params+")";
  }

  On_Mouse_Move_Cmd(ctx, c_pt, cmd)
  {
    if (cmd.id == "pt")
    {
      const pts = {x: 1/ctx.scl.x, y: 1/ctx.scl.y};
      const c_pt_s = {x: c_pt.x, y: c_pt.y};
      this.Pt_Scale(c_pt_s, pts);
      const ptd = this.Pt_Difference(c_pt_s, cmd);

      this.Pt_Translate(this.cp, ptd);
      this.Pt_Translate(this.sa, ptd);
      this.Pt_Translate(this.ea, ptd);
    }
    super.On_Mouse_Move_Cmd(ctx, c_pt, cmd);
  }

  Render(ctx)
  {
    let r;

    super.Render(ctx);
    ctx.arc(this.pt.x, this.pt.y, this.Calc_Radius(), 
      this.Calc_Start_Angle(), this.Calc_End_Angle()); // [, anticlockwise]);
  }

  Render_Design(ctx)
  {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.def_stroke_style;
    ctx.setLineDash([5, 5]);

    const cp2 = {x: 2*this.pt.x-this.cp.x, y: 2*this.pt.y-this.cp.y};
    ctx.moveTo(this.cp.x, this.cp.y);
    ctx.lineTo(this.cp.x, cp2.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.lineTo(cp2.x, this.cp.y);
    ctx.lineTo(this.cp.x, this.cp.y);

    ctx.moveTo(this.pt.x, this.pt.y);
    ctx.lineTo(this.sa.x, this.sa.y);

    ctx.moveTo(this.pt.x, this.pt.y);
    ctx.lineTo(this.ea.x, this.ea.y);

    ctx.stroke();
    ctx.restore();
  }
}

export class Shape_Ellipse extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_Ellipse";
    this.cp = this.New_Btn_Path("cp", 100, 100);
    this.sa = this.New_Btn_Path("sa", 100, 0);
    this.ea = this.New_Btn_Path("ea", -120, 0);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "x = "+Round(this.pt.x), s);
    res = Append_Str(res, "y = "+Round(this.pt.y), s);
    res = Append_Str(res, "radiusx = "+Round(this.Calc_Radius_X()), s);
    res = Append_Str(res, "radiusy = "+Round(this.Calc_Radius_Y()), s);
    res = Append_Str(res, "startAngle = "+Round(this.Calc_Start_Angle()), s);
    res = Append_Str(res, "endAngle = "+Round(this.Calc_End_Angle()), s);

    return res;
  }

  To_Cmd_Str()
  {
    const s = ", ";
    const x = this.pt.x;
    const y = this.pt.y;
    const radius_x = this.Calc_Radius_X();
    const radius_y = this.Calc_Radius_Y();
    const rotation = 0;
    const startAngle = this.Calc_Start_Angle();
    const endAngle = this.Calc_End_Angle();
    let params;

    params = Append_Str(params, x, s);
    params = Append_Str(params, y, s);
    params = Append_Str(params, radius_x, s);
    params = Append_Str(params, radius_y, s);
    params = Append_Str(params, rotation, s);
    params = Append_Str(params, startAngle, s);
    params = Append_Str(params, endAngle, s);

    return "ellipse("+params+")";
  }

  Calc_Radius_X()
  {
    return Math.abs(this.cp.x-this.pt.x);
  }

  Calc_Radius_Y()
  {
    return Math.abs(this.cp.y-this.pt.y);
  }

  Calc_Start_Angle()
  {
    const pta = this.Pt_Difference(this.sa, this.pt);
    return Math.atan2(pta.y, pta.x);
  }

  Calc_End_Angle()
  {
    const ptb = this.Pt_Difference(this.ea, this.pt);
    return Math.atan2(ptb.y, ptb.x);
  }

  On_Mouse_Move_Cmd(ctx, c_pt, cmd)
  {
    if (cmd.id == "pt")
    {
      const pts = {x: 1/ctx.scl.x, y: 1/ctx.scl.y};
      const c_pt_s = {x: c_pt.x, y: c_pt.y};
      this.Pt_Scale(c_pt_s, pts);
      const ptd = this.Pt_Difference(c_pt_s, cmd);
      
      this.Pt_Translate(this.cp, ptd);
      this.Pt_Translate(this.sa, ptd);
      this.Pt_Translate(this.ea, ptd);
    }
    super.On_Mouse_Move_Cmd(ctx, c_pt, cmd);
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.ellipse(this.pt.x, this.pt.y, 
      this.Calc_Radius_X(), this.Calc_Radius_Y(), 
      0, this.Calc_Start_Angle(), this.Calc_End_Angle()); // [, anticlockwise]);
  }

  Render_Design(ctx)
  {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.def_stroke_style;
    ctx.setLineDash([5, 5]);

    const cp2 = {x: 2*this.pt.x-this.cp.x, y: 2*this.pt.y-this.cp.y};
    ctx.moveTo(this.cp.x, this.cp.y);
    ctx.lineTo(this.cp.x, cp2.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.lineTo(cp2.x, this.cp.y);
    ctx.lineTo(this.cp.x, this.cp.y);

    ctx.moveTo(this.pt.x, this.pt.y);
    ctx.lineTo(this.sa.x, this.sa.y);

    ctx.moveTo(this.pt.x, this.pt.y);
    ctx.lineTo(this.ea.x, this.ea.y);

    ctx.stroke();
    ctx.restore();
  }
}

export class Shape_Rect extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_Rect";
    this.cp = this.New_Btn_Path("cp", 100, 100);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "x = "+Round(this.pt.x), s);
    res = Append_Str(res, "y = "+Round(this.pt.y), s);
    res = Append_Str(res, "width = "+Round(this.Calc_Width()), s);
    res = Append_Str(res, "height = "+Round(this.Calc_Height()), s);

    return res;
  }

  To_Cmd_Str()
  {
    const s = ", ";
    let params;

    params = Append_Str(params, this.pt.x, s);
    params = Append_Str(params, this.pt.y, s);
    params = Append_Str(params, this.Calc_Width(), s);
    params = Append_Str(params, this.Calc_Height(), s);

    return "rect("+params+")";
  }

  Calc_Width()
  {
    return this.cp.x-this.pt.x;
  }

  Calc_Height()
  {
    return this.cp.y-this.pt.y;
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.rect(this.pt.x, this.pt.y, this.Calc_Width(), this.Calc_Height());
  }
}

export class Shape_ClosePath extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_ClosePath";
    this.Init_Shape();
  }

  Params_Str()
  {
    return "";
  }

  To_Cmd_Str()
  {
    return "closePath()";
  }

  Render(ctx)
  {
    ctx.closePath();
  }
}

export class Shape_ArcTo extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_ArcTo";
    this.cp = this.New_Btn_Path("cp", 100, 100);
    this.rp = this.New_Btn_Path("rp", 100, 0);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "x1 = "+Round(this.pt.x), s);
    res = Append_Str(res, "y1 = "+Round(this.pt.y), s);
    res = Append_Str(res, "x2 = "+Round(this.cp.x), s);
    res = Append_Str(res, "y2 = "+Round(this.cp.y), s);
    res = Append_Str(res, "radius = "+Round(this.Calc_Radius()), s);

    return res;
  }

  To_Cmd_Str()
  {
    const s = ", ";
    let params;

    params = Append_Str(params, this.pt.x, s);
    params = Append_Str(params, this.pt.y, s);
    params = Append_Str(params, this.cp.x, s);
    params = Append_Str(params, this.cp.y, s);
    params = Append_Str(params, this.Calc_Radius(), s);

    return "arc("+params+")";
  }

  Calc_Radius()
  {
    return Math.hypot(this.rp.x, this.rp.y);
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.arcTo(this.pt.x, this.pt.y, this.cp.x, this.cp.y, this.Calc_Radius());
  }

  Render_Design(ctx)
  {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.def_stroke_style;
    ctx.setLineDash([5, 5]);

    ctx.moveTo(this.prev_shape.pt.x, this.prev_shape.pt.y);
    ctx.lineTo(this.cp.x, this.cp.y);
    ctx.lineTo(this.pt.x, this.pt.y);

    ctx.moveTo(0, 0);
    ctx.lineTo(this.rp.x, this.rp.y);

    ctx.stroke();
    ctx.restore();
  }
}

export class Shape_QuadraticCurveTo extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_QuadraticCurveTo";
    this.cp = this.New_Btn_Path("cp", 100, 100);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "cpx = "+Round(this.cp.x), s);
    res = Append_Str(res, "cpy = "+Round(this.cp.y), s);
    res = Append_Str(res, "x = "+Round(this.pt.x), s);
    res = Append_Str(res, "y = "+Round(this.pt.y), s);

    return res;
  }

  To_Cmd_Str()
  {
    const s = ", ";
    let params;

    params = Append_Str(params, this.cp.x, s);
    params = Append_Str(params, this.cp.y, s);
    params = Append_Str(params, this.pt.x, s);
    params = Append_Str(params, this.pt.y, s);

    return "quadraticCurveTo("+params+")";
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.quadraticCurveTo(this.cp.x, this.cp.y, this.pt.x, this.pt.y);
  }

  Render_Design(ctx)
  {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.def_stroke_style;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(this.prev_shape.pt.x, this.prev_shape.pt.y);
    ctx.lineTo(this.cp.x, this.cp.y);
    ctx.lineTo(this.pt.x, this.pt.y);
    ctx.stroke();
    ctx.restore();
  }
}

export class Shape_BezierCurveTo extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_BezierCurveTo";
    this.cp1 = this.New_Btn_Path("cp1", -100, -100);
    this.cp2 = this.New_Btn_Path("cp2", 100, 100);
  }

  Params_Str()
  {
    const s = ", ";
    let res = "";

    res = Append_Str(res, "cp1x = "+Round(this.cp1.x), s);
    res = Append_Str(res, "cp1y = "+Round(this.cp1.y), s);
    res = Append_Str(res, "cp2x = "+Round(this.cp2.x), s);
    res = Append_Str(res, "cp2y = "+Round(this.cp2.y), s);
    res = Append_Str(res, "x = "+Round(this.pt.x), s);
    res = Append_Str(res, "y = "+Round(this.pt.x), s);

    return res;
  }

  To_Cmd_Str()
  {
    const s = ", ";
    let params;

    params = Append_Str(params, this.cp1.x, s);
    params = Append_Str(params, this.cp1.y, s);
    params = Append_Str(params, this.cp2.x, s);
    params = Append_Str(params, this.cp2.y, s);
    params = Append_Str(params, this.pt.x, s);
    params = Append_Str(params, this.pt.y, s);

    return "bezierCurveTo("+params+")";
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.pt.x, this.pt.y);
  }

  Render_Design(ctx)
  {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.def_stroke_style;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(this.prev_shape.pt.x, this.prev_shape.pt.y);
    ctx.lineTo(this.cp1.x, this.cp1.y);
    ctx.moveTo(this.cp2.x, this.cp2.y);
    ctx.lineTo(this.pt.x, this.pt.y);
    ctx.stroke();
    ctx.restore();
  }
}

export class Shape_LineTo extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_LineTo";
  }

  To_Cmd_Str()
  {
    const s = ", ";
    let params;

    params = Append_Str(params, this.pt.x, s);
    params = Append_Str(params, this.pt.y, s);

    return "lineTo("+params+")";
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.lineTo(this.pt.x, this.pt.y);
  }
}

export class Shape_MoveTo extends Shape
{
  constructor()
  {
    super();
    this.class_name = "Shape_MoveTo";
  }

  Render(ctx)
  {
    super.Render(ctx);
    ctx.moveTo(this.pt.x, this.pt.y);
  }
}

// Utils ==========================================================================================

export function Render(plants)
{
  var c, plant;

  for (c = 0; c < plants.length; c++)
  {
    plant = plants[c];
    plant.canvas_ctx.clearRect(0, 0, plant.canvas_ctx.canvas.width, plant.canvas_ctx.canvas.height);
    plant.Render_All();
  }
}

export function Append_Str(a, b, sep)
{
  let res = "";

  if (!Empty(a) && !Empty(b))
  {
    res = a+sep+b;
  }
  else if (Empty(a) && !Empty(b))
  {
    res = b;
  }
  else if (!Empty(a) && Empty(b))
  {
    res = a;
  }

  return res;
}

function Empty(v)
{
  const res = v == null || v == undefined || v === "";
  return res;
}

function Round(num)
{
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
}

export function To_Canvas_Pt(ctx, sx, sy)
{
  const m = ctx.getTransform();
  m.invertSelf();

  const sp = new DOMPointReadOnly(sx, sy);
  const pt = sp.matrixTransform(m);

  return pt;
}

export function To_Screen_Pt(ctx, cx, cy)
{
  const m = ctx.getTransform();

  const cp = new DOMPointReadOnly(cx, cy);
  const pt = cp.matrixTransform(m);

  return pt;
}
