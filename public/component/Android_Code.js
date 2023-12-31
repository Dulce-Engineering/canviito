import { Bezier } from "../lib/bezierjs/bezier.js";
import Utils from "../lib/Utils.js";

class Android_Code extends HTMLElement 
{
  static tname = "android-code";

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

    const data = this.Gen_Cmds(shapes);
    code = 
      "public class Shape implements rs.projecta.ogl.Is_Drawable\n" +
      "{\n" +
        "\tpublic static java.nio.FloatBuffer points = rs.projecta.ogl.Context.New_Buffer(Get_Points());\n" +
        "\n" +
    
        "\tpublic static float[] Get_Points()\n" +
        "\t{\n" +
          "\t\tfloat[] points=\n" +
          "\t\t{\n" +
          this.Gen_Points(data.points) +
          "\t\t};\n" +
          "\n" +
          "\t\treturn points;\n" +
        "\t};\n" +
        "\n" +
    
        "\tpublic java.nio.FloatBuffer Get_Points_Buffer()\n" +
        "\t{\n" +
          "\t\treturn this.points;\n" +
        "\t};\n" +
        "\n" +

        "\tpublic void Draw(rs.projecta.ogl.Context ctx, int frame_idx)\n" +
        "\t{\n" +
          this.Gen_Segments(data.segments) +
        "\t}\n" +
      "}\n";

    this.txt_area.value = code;
  }

  Gen_Segments(segments)
  {
    let res = "", segment, i;

    if (segments && segments.length>0)
    {
      for (i=0; i<segments.length; i++)
      {
        segment = segments[i];
        res += "\t\tandroid.opengl.GLES20.glDrawArrays(" + 
          segment.mode + ", " + segment.pt_start + ", " + segment.pt_count + ");\n";
      }
    }

    return res;
  }

  Gen_Points(points)
  {
    let res = "", i;

    if (points && points.length>0)
    {
      for (i=0; i<points.length; i++)
      {
        res = Utils.appendStr(res, this.Round(points[i]) + "f", ", ");
        if ((i+1)%10 == 0)
        {
          res+= "\n\t\t\t";
        }
      }
      res = "\t\t\t" + res + "\n";
    }

    return res;
  }

  Gen_Cmds(shapes)
  {
    let res = null;
    let segment = null;
    const segments = [], points = [];

    if (shapes && shapes.length>0)
    {
      for (let i=0; i<shapes.length; i++)
      {
        const s = shapes[i];
        if (s.class_name == "Shape_MoveTo")
        {
          segment = this.New_Segment(segments, points, segment);
          this.Add_Pt(segment, points, s.pt);
        }
        else if (s.class_name == "Shape_LineTo")
        {
          this.Add_Pt(segment, points, s.pt);
        }
        else if (s.class_name == "Shape_ClosePath")
        {
          segment.mode = "android.opengl.GLES20.GL_LINE_LOOP";
        }
        else if (s.class_name == "Shape_BezierCurveTo")
        {
          const m = this.Get_Lats_Pt(points);
          const curve = new Bezier(m.x, m.y, s.cp1.x, s.cp1.y, 
            s.cp2.x, s.cp2.y, s.pt.x, s.pt.y);
          const pts = curve.getLUT(20);
          this.Add_Pts(segment, points, pts);
        }
        else if (s.class_name == "Shape_QuadraticCurveTo")
        {
          const m = this.Get_Lats_Pt(points);
          const curve = new Bezier(m.x, m.y, s.cp.x, s.cp.y, s.pt.x, s.pt.y);
          const pts = curve.getLUT(20);
          this.Add_Pts(segment, points, pts);
        }
        else if (s.class_name == "Shape_Rect")
        {
          segment = this.New_Segment(segments, points, segment);
          this.Add_Pt(segment, points, s.pt);
          this.Add_Pt(segment, points, {x: s.cp.x, y: s.pt.y});
          this.Add_Pt(segment, points, s.cp);
          this.Add_Pt(segment, points, {x: s.pt.x, y: s.cp.y});
          this.Add_Pt(segment, points, s.pt);
        }
        else if (s.class_name == "Shape_Ellipse")
        {
          const pts = this.Get_Ellipse(
            s.pt.x, s.pt.y, 
            s.Calc_Radius_X(), s.Calc_Radius_Y(), 
            s.Calc_Start_Angle(), s.Calc_End_Angle());
          this.Add_Pts(segment, points, pts);
        }
        else if (s.class_name == "Shape_Arc")
        {
          const pts = this.Get_Ellipse(
            s.pt.x, s.pt.y, 
            s.Calc_Radius(), s.Calc_Radius(), 
            s.Calc_Start_Angle(), s.Calc_End_Angle());
          this.Add_Pts(segment, points, pts);
        }
      }
      segments.push(segment);
      res = {segments, points};
    }

    return res;
  }

  Get_Ellipse(cx, cy, radius_x, radius_y, start_angle, end_angle)
  {
    const angle = 0;
    const res = [];
    const dx = 1;
    const a1 = this.Normalise_Angle(start_angle);
    let a2 = this.Normalise_Angle(end_angle);
    if (a1>a2)
    {
      a2 = a2 + 2*Math.PI;
    }
    const dy = a2 - a1;

    for (let xt = 0; xt < dx; xt += 0.05) 
    {
      const a = (dy/dx)*xt+a1;

      //const x = cx - (radius_x * Math.sin(a)) * Math.sin(angle) + (radius_y * Math.cos(a)) * Math.cos(angle);
      //const y = cy + (radius_y * Math.cos(a)) * Math.sin(angle) + (radius_x * Math.sin(a)) * Math.cos(angle);
      const x = cx + (radius_x * Math.cos(a));
      const y = cy + (radius_y * Math.sin(a));
      
      res.push({x, y});
    }

    return res;
  }

  Normalise_Angle(a)
  {
    let na = a;

    if (a<0)
    {
      na = 2*Math.PI + a;
    }

    return na;
  }

  Add_Pts(segment, points, pts)
  {
    for (const pt of pts)
    {
      this.Add_Pt(segment, points, pt);
    }
  }

  Add_Pt(segment, points, pt)
  {
    segment.pt_count++;
    points.push(pt.x);
    points.push(pt.y);
  }

  New_Segment(segments, points, prev_segment)
  {
    if (prev_segment)
    {
      segments.push(prev_segment);
    }
    const segment = 
      {mode: "android.opengl.GLES20.GL_LINE_STRIP", pt_start: points.length/2, pt_count: 0};

    return segment;
  }

  Get_Lats_Pt(points)
  {
    const res = {x: 0, y: 0};

    if (points != null && points.length >= 2)
    {
      const last_idx = points.length - 1;
      res.y = points[last_idx];
      res.x = points[last_idx - 1];
    }

    return res;
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
            <h1>Android Code</h1>
            <img cid="close_btn" src="images/close.svg">
          </header>
          <textarea cid="txt_area"></textarea>
        </div>
      </dialog>
    `;
    Utils.Set_Id_Shortcuts(this, this, "cid");

    this.close_btn.addEventListener("click", this.On_Click_Close);
  }
}

Utils.Register_Element(Android_Code);

export default Android_Code;
