import "./Canvas_Code.js";
import "./Path_Code.js";
import "./Android_Code.js";
import "./Shape_Dlg.js";
import * as pl from "../lib/Shapes.js";
import Utils from "../lib/Utils.js";

class Shape_List extends HTMLElement
{
  static tname = "shape-list";

  constructor()
  {
    super();
    this.on_change_fn = null;
    this.shapes = [];
    this.code_gen_type = null;

    Utils.Bind(this, "On_");
  }
  
  connectedCallback()
  {
    this.render();

    this.Load();
    this.Set_Code_Gen_Type("android_code");
    this.shape_dlg.addEventListener("edit", this.On_Click_Edit_Ok);
  }
  
  Set_Code_Gen_Type(code_gen_type)
  {
    this.code_gen_type = code_gen_type;
    this.canvas_code.classList.remove("selected");
    this.path_code.classList.remove("selected");
    this.android_code.classList.remove("selected");
    this[code_gen_type].classList.add("selected");
  }

  Save()
  {
    const json = JSON.stringify(this.shapes, this.JSON_Replacer);
    localStorage.setItem("shapes", json);
  }

  Load()
  {
    const json = localStorage.getItem("shapes");
    const res = this.Load_JSON(json);

    return res;
  }

  Load_JSON(json)
  {
    let res = false;

    if (json)
    {
      this.shapes = JSON.parse(json);
      this.shapes = this.shapes.map((p) => this.Revive_Shape(p));
      if (this.shapes && this.shapes.length>1)
      {
        for (let i = 1; i<this.shapes.length; i++)
        {
          this.shapes[i].prev_shape = this.shapes[i-1];
        }
      }
      this.requestUpdate();
      res = true;
    }

    return res;
  }

  Revive_Shape(obj)
  {
    const shape = new pl[obj.class_name];
    Object.assign(shape, obj);
    if (obj.btns && obj.btns.length>0)
    {
      shape.btns = [];
      for (let i=0; i<obj.btns.length; ++i)
      {
        const obj_btn = obj.btns[i];
        const btn = shape.New_Btn_Path(obj_btn.id, obj_btn.x, obj_btn.y);
        shape[btn.id] = btn;
      }
    }
    return shape;
  }

  JSON_Replacer(key, value)
  {
    if (key == "prev_shape" || key == "pt" || 
      key == "cp" || key == "sa" ||
      key == "ea" || key == "rp" ||
      key == "cp1" || key == "cp2")
    {
      value = "dynamic";
    }

    return value;
  }

  Round(num)
  {
    return Math.round((num + Number.EPSILON) * 10000) / 10000;
  }

  Set_Disabled(disabled)
  {
    let btns, i;

    btns = this.querySelectorAll("button");
    if (btns && btns.length>0)
    {
      btns.forEach((btn) => btn.disabled = disabled);
    }
  }

  requestUpdate()
  {
    const items = this.Render_Items();
    this.items_body.replaceChildren(...items);
  }

  // Utils ========================================================================================

  Get_Last_Idx()
  {
    return this.shapes.length-1;
  }

  Get_Selected_Shape()
  {
    let res;

    const i = this.Get_Selected_Idx();
    if (i >= 0)
    {
      res = this.shapes[i];
    }

    return res;
  }

  Get_Selected_Idx()
  {
    let shape;
    let res = -1;

    if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        if (shape.selected)
        {
          res = i;
          break;
        }
      }
    }

    return res;
  }

  Get_Shape_Idx(shape_id)
  {
    let res = null;

    if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        if (this.shapes[i].id == shape_id)
        {
          res = i;
          break;
        }
      }
    }

    return res;
  }

  Get_Shape_By_Id(id)
  {
    const i = this.Get_Shape_Idx(id);
    const shape = this.shapes[i];
    return shape;
  }

  // API ==========================================================================================

  Hide()
  {
    this.table.classList.remove("show-list");
  }

  Show()
  {
    this.table.classList.add("show-list");
  }

  List_Is_Visible()
  {
    return this.table.classList.contains("show-list");
  }

  Toggle_Show()
  {
    let res;

    if (this.List_Is_Visible())
    {
      this.Hide();
      res = false;
    }
    else
    {
      this.Show();
      res = true;
    }

    return res;
  }

  Add(shape)
  {
    shape.id = Date.now();
    if (this.shapes.length>0)
    {
      shape.prev_shape = this.shapes[this.shapes.length-1];
    }

    this.shapes.push(shape);
    this.requestUpdate();
  }

  Edit_Plant(shape)
  {
    const i = this.Get_Shape_Idx(plant);
    this.shapes[i] = shape;
    this.requestUpdate();
  }

  Delete(shape_id)
  {
    const msg = "Are you sure you want to delete this shape?";
    let i;

    const do_delete = confirm(msg);
    if (do_delete)
    {
      i = this.Get_Shape_Idx(shape_id);
      if (i != this.Get_Last_Idx())
      {
        const this_shape = this.shapes[i];
        const next_shape = this.shapes[i+1];
        next_shape.prev_shape = this_shape.prev_shape;
      }
      this.shapes.splice(i, 1);
      this.requestUpdate();
    }

    return do_delete;
  }

  Select(shape_id)
  {
    let shape;

    if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        shape.selected = false;
        if (shape.id == shape_id)
        {
          shape.selected = true;
        }
      }
      this.requestUpdate();
    }
  }

  Select_Next()
  {
    const i = this.Get_Selected_Idx();
    const last_i = this.Get_Last_Idx();
    this.shapes[i].selected = false;
    if (i >= 0 && i < last_i)
    {
      this.shapes[i+1].selected = true;
    }
    else
    {
      this.shapes[0].selected = true;
    }
    this.requestUpdate();
  }

  Select_Prev()
  {
    const i = this.Get_Selected_Idx();
    const last_i = this.Get_Last_Idx();
    this.shapes[i].selected = false;
    if (i > 0 && i <= last_i)
    {
      this.shapes[i-1].selected = true;
    }
    else
    {
      this.shapes[last_i].selected = true;
    }
    this.requestUpdate();
  }

  moveShapeToCentre(shape)
  {
    if (this.ctx)
    {
      const pt = pl.To_Canvas_Pt(this.ctx, this.ctx.canvas.width/2, this.ctx.canvas.height/2);
      shape.pt.x = pt.x;
      shape.pt.y = pt.y;
    }
  }

  Add_Shape(class_name, shape_name, data)
  {
    const shape = new pl[class_name];
    shape.class_name = class_name;
    shape.name = shape_name;

    this.Add(shape);
    /*this.moveShapeToCentre(shape);
    if (class_name == "Shape_Rect")
    {
      shape.cp.x = data.cp.x;
      shape.cp.y = data.cp.y;
    }*/
    this.Select(shape.id);
    this.Save();

    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  // Events =======================================================================================
    
  On_Click_Copy(event)
  {
    /*let data;
    const shape_id = event.currentTarget.getAttribute("shape-id");
    const shape = this.Get_Shape_By_Id(shape_id);

    if (shape.class_name == "Shape_Rect")
    {
      data = { cp: { x: shape.cp.x, y: shape.cp.y } };
    }
    this.Add_Shape(shape.class_name, shape.name, data);*/
  }

  On_Click_Delete(event)
  {
    const shape_id = event.currentTarget.getAttribute("shape-id");
    const deleted = this.Delete(shape_id);
    if (deleted && this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_Select(event)
  {
    const shape_id = event.currentTarget.getAttribute("shape-id");
    this.Select(shape_id);
    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_Edit(event)
  {
    const id = event.currentTarget.getAttribute("shape-id");
    const i = this.Get_Shape_Idx(id);
    const shape = this.shapes[i];

    this.shape_dlg.Show(shape);
  }

  On_Click_Edit_Ok()
  {
    const shape = this.shape_dlg.value;
    const i = this.Get_Shape_Idx(shape.id);
    this.shapes[i] = shape;
    this.requestUpdate();
    if (this.on_change_fn)
      this.on_change_fn(this.shapes);
  }

  On_Click_Gen_Code()
  {
    this.canvas_code_gen.Hide();
    this.path_code_gen.Hide();
    this.android_code_gen.Hide();

    if (this.code_gen_type == "canvas_code")
    {
      canvas_code_gen.Show();
      canvas_code_gen.Gen_Code(this.shapes);
    }
    else if (this.code_gen_type == "path_code")
    {
      path_code_gen.Show();
      path_code_gen.Gen_Code(this.shapes);
    }
    else if (this.code_gen_type == "android_code")
    {
      android_code_gen.Show();
      android_code_gen.Gen_Code(this.shapes);
    }
  }

  On_Click_Code_Type(event)
  {
    this.Set_Code_Gen_Type(event.currentTarget.id);
  }

  On_Click_Reset()
  {
    localStorage.removeItem("shapes");
    this.shapes = [];
    this.requestUpdate();
    this.Set_Code_Gen_Type(this.code_gen_type);
    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_Upload()
  {
    this.file_elem = document.createElement("input");
    this.file_elem.type = "file";
    this.file_elem.addEventListener("change", this.On_Change_File);
    this.file_elem.click();
  }

  On_Change_File()
  {
    const reader = new FileReader();
    reader.onload = () => this.On_Load_File(reader.result);
    reader.readAsText(this.file_elem.files[0]);
  }

  On_Load_File(json)
  {
    this.Load_JSON(json);
    this.Save();
    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_Download()
  {
    const json = JSON.stringify(this.shapes, this.JSON_Replacer);
    const href = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    this.download.setAttribute("href", href);
  }

  On_Click_Undo()
  {

  }

  On_Click_Prev()
  {
    this.Select_Prev();
    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_Next()
  {
    this.Select_Next();
    if (this.on_change_fn)
    {
      this.on_change_fn(this.shapes);
    }
  }

  On_Click_List(event)
  {
    if (this.Toggle_Show())
    {
      this.list_btn.classList.add("selected");
    }
    else
    {
      this.list_btn.classList.remove("selected");
    }
  }

  On_Click_Add_MoveTo()
  {
    this.Add_Shape("Shape_MoveTo", "moveTo");
  }

  On_Click_Add_LineTo()
  {
    this.Add_Shape("Shape_LineTo", "lineTo");
  }

  On_Click_Add_BezierTo()
  {
    this.Add_Shape("Shape_BezierCurveTo", "bezierCurveTo");
  }

  On_Click_Add_QuadraticTo()
  {
    this.Add_Shape("Shape_QuadraticCurveTo", "quadraticCurveTo");
  }

  On_Click_Add_ArcTo()
  {
    this.Add_Shape("Shape_ArcTo", "arcTo");
  }

  On_Click_Add_Rect()
  {
    this.Add_Shape("Shape_Rect", "rect");
  }

  On_Click_Add_Arc()
  {
    this.Add_Shape("Shape_Arc", "arc");
  }

  On_Click_Add_Ellipse()
  {
    this.Add_Shape("Shape_Ellipse", "ellipse");
  }

  On_Click_Add_ClosePath()
  {
    this.Add_Shape("Shape_ClosePath", "closePath");
  }

  // Rendering ====================================================================================

  render()
  {
    const html = `
      <div id="panel_elem">

        <div id="btn_bar">
          <button class="button" id="new_moveto" title="Move To"><img src="images/vector-point.svg"></button>
          <button class="button" id="new_lineto" title="Line To"><img src="images/vector-line.svg"></button>
          <button class="button" id="new_bezierto" title="Bezier To"><img src="images/vector-bezier.svg"></button>
          <button class="button" id="new_quadraticto" title="Quadratic To"><img src="images/vector-curve.svg"></button>
          <button class="button" id="new_arcto" title="Arc To"><img src="images/vector-radius.svg"></button>
          <button class="button" id="new_arc" title="Arc"><img src="images/vector-circle.svg"></button>
          <button class="button" id="new_ellipse" title="Ellipse"><img src="images/vector-ellipse.svg"></button>
          <button class="button" id="new_rect" title="Rect"><img src="images/vector-rectangle.svg"></button>
          <button class="button" id="new_closepath" title="ClosePath"><img src="images/vector-polygon.svg"></button>
  
          &#183; <button class="button" id="list_btn" title="Show Shape List"><img src="images/format-list-bulleted-square.svg"></button>
          <button class="button" id="prev_btn" title="Previous Shape"><img src="images/skip-previous.svg"></button>
          <button class="button" id="next_btn" title="Next Shape"><img src="images/skip-next.svg"></button>
          <button class="button" id="undo_btn" title="Undo"><img src="images/undo.svg"></button>
          
          &#183; <button class="button" id="gen_btn" title="Generate Code"><img src="images/code-json.svg"></button>
          <button class="button" id="canvas_code" title="Canvas Code"><img src="images/image.svg"></button>
          <button class="button" id="path_code" title="Path Code"><img src="images/vector-polyline.svg"></button>
          <button class="button" id="android_code" title="Android Code"><img src="images/android.svg"></button>
          
          &#183; <button class="button" id="reset" title="Reset"><img src="images/nuke.svg"></button>
          <button class="button" id="upload" title="Upload"><img src="images/upload.svg"></button>
          <a class="button" id="download" href="" download="shape.json" title="Download"><img src="images/download.svg"></a>
        </div>

        <div id="table">
          <table>
            <thead>
              <tr>
                <th>Actions</th>
                <th>#</th>
                <th>Function</th>
                <th>Parameters</th>
              </tr>
            </thead>
            <tbody id="items_body">
            </tbody>
          </table>
        </div>
      </div>

      <div id="summ_elem"></div>

      <shape-dlg id="shape_dlg"></shape-dlg>

      <canvas-code id="canvas_code_gen" class="code_gen"></canvas-code>
      <path-code id="path_code_gen" class="code_gen"></path-code>
      <android-code id="android_code_gen" class="code_gen"></android-code>
    `;
    this.innerHTML = html;
    Utils.Set_Id_Shortcuts(this, this);

    this.new_moveto.addEventListener("click", this.On_Click_Add_MoveTo);
    this.new_lineto.addEventListener("click", this.On_Click_Add_LineTo);
    this.new_bezierto.addEventListener("click", this.On_Click_Add_BezierTo);
    this.new_quadraticto.addEventListener("click", this.On_Click_Add_QuadraticTo);
    this.new_arcto.addEventListener("click", this.On_Click_Add_ArcTo);
    this.new_arc.addEventListener("click", this.On_Click_Add_Arc);
    this.new_ellipse.addEventListener("click", this.On_Click_Add_Ellipse);
    this.new_rect.addEventListener("click", this.On_Click_Add_Rect);
    this.new_closepath.addEventListener("click", this.On_Click_Add_ClosePath);

    this.list_btn.addEventListener("click", this.On_Click_List);
    this.prev_btn.addEventListener("click", this.On_Click_Prev);
    this.next_btn.addEventListener("click", this.On_Click_Next);
    this.undo_btn.addEventListener("click", this.On_Click_Undo);

    this.gen_btn.addEventListener("click", this.On_Click_Gen_Code);
    this.canvas_code.addEventListener("click", this.On_Click_Code_Type);
    this.path_code.addEventListener("click", this.On_Click_Code_Type);
    this.android_code.addEventListener("click", this.On_Click_Code_Type);

    this.reset.addEventListener("click", this.On_Click_Reset);
    this.upload.addEventListener("click", this.On_Click_Upload);
    this.download.addEventListener("click", this.On_Click_Download);
  }

  Render_Items()
  {
    let res = [], shape;

    if (this.shapes && this.shapes.length>0)
    {
      for (let i=0; i<this.shapes.length; i++)
      {
        shape = this.shapes[i];
        res.push(this.Render_Item(i, shape));
      }
    }
    else
    {
      const td = document.createElement("td");
      td.classList.add("msg");
      td.setAttribute("colspan", 9);
      td.innerText = "No shapes added yet. Get to work!";

      const tr = document.createElement("tr");
      tr.append(td);

      res.push(tr);
    }
    return res;
  }

  Render_Item(i, shape)
  {
    let btn_class = "button";

    if (shape.selected)
    {
      btn_class = "button selected";
      this.Render_Summary(shape);
    }

    const td1 = document.createElement("td");
    td1.setAttribute("nowrap", true);
    td1.classList.add("btns");
    td1.append(this.Render_Button(shape.id, this.On_Click_Select, "target.svg", true, "Select", btn_class));
    td1.append(this.Render_Button(shape.id, this.On_Click_Copy, "content-copy.svg", true, "Copy", "button"));
    td1.append(this.Render_Button(shape.id, this.On_Click_Edit, "pencil-outline.svg", shape.can_edit, "Edit", "button"));
    td1.append(this.Render_Button(shape.id, this.On_Click_Delete, "delete-outline.svg", shape.can_delete, "Delete", "button"));

    const td2 = document.createElement("td");
    td2.innerText = i+1;

    const td3 = document.createElement("td");
    td3.innerText = shape.name;

    const td4 = document.createElement("td");
    td4.innerText = shape.Params_Str();

    const tr = document.createElement("tr");
    tr.setAttribute("shape-id", shape.id);
    tr.append(td1, td2, td3, td4);

    return tr;
  }

  Render_Button(id, on_click_fn, image, can_render, title, btn_class)
  {
    let btn = null;

    if (can_render == null || can_render == true)
    {
      btn = document.createElement("img");
      btn.setAttribute("shape-id", id);
      btn.setAttribute("title", title);
      const classes = btn_class.split(" ");
      classes.forEach( c => btn.classList.add(c) );
      btn.addEventListener("click", on_click_fn);
      btn.src = "images/" + image;
    }

    return btn;
  }

  Render_Summary(shape)
  {
    this.summ_elem.innerText = shape.name + " " + shape.Params_Str();
  }
}

Utils.Register_Element(Shape_List);

export default Shape_List;
