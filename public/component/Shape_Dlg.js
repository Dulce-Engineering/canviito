import Utils from "../lib/Utils.js";

class Shape_Dlg extends HTMLElement 
{
  static tname = "shape-dlg";

  constructor()
  {
    super();
    this.onclick_edit_ok = null;
    this.shape = null;

    Utils.Bind(this, "On_");
  }

  connectedCallback()
  {
    this.render();
  }

  get value()
  {
    switch (this?.shape?.class_name)
    {
      case "Shape_LineTo":
        this.shape.pt.x = Number.parseFloat(this.x_elem.value);
        this.shape.pt.y = Number.parseFloat(this.y_elem.value);
        break;
      case "Shape_MoveTo":
        this.shape.pt.x = Number.parseFloat(this.x_elem.value);
        this.shape.pt.y = Number.parseFloat(this.y_elem.value);
        break;
      case "Shape_Arc":
        this.shape.pt.x = Number.parseFloat(this.x_elem.value);
        this.shape.pt.y = Number.parseFloat(this.y_elem.value);
        this.shape.Set_Radius(Number.parseFloat(this.radius_elem.value));
        this.shape.Set_Start_Angle(Number.parseFloat(this.start_angle_elem.value));
        this.shape.Set_End_Angle(Number.parseFloat(this.end_angle_elem.value));
        break;
      case "Shape_Rect":
        this.shape.pt.x = Number.parseFloat(this.x_elem.value);
        this.shape.pt.y = Number.parseFloat(this.y_elem.value);
        this.shape.cp.x = Number.parseFloat(this.x2_elem.value);
        this.shape.cp.y = Number.parseFloat(this.y2_elem.value);
        break;
      case "Shape_QuadraticCurveTo":
        this.shape.pt.x = Number.parseFloat(this.x_elem.value);
        this.shape.pt.y = Number.parseFloat(this.y_elem.value);
        this.shape.cp.x = Number.parseFloat(this.x2_elem.value);
        this.shape.cp.y = Number.parseFloat(this.y2_elem.value);
        break;
    }

    return this.shape;
  }

  // events =======================================================================================

  On_Click_Edit_Ok()
  {
    this.Hide();
    this.dispatchEvent(new Event("edit"));
  }

  On_Click_Cancel()
  {
    this.Hide();
  }

  // rendering ====================================================================================

  Hide_Fields()
  {
    const input_elems = this.querySelectorAll("input");
    for (const input_elem of input_elems)
    {
      input_elem.hidden = true;
      const label_elem = this.querySelector("label[for=\"" + input_elem.id +"\"]");
      label_elem.hidden = true;
    }
  }

  Show(shape)
  {
    this.shape = shape;
    this.type_elem.innerText = shape.name;

    this.Hide_Fields();
    switch (shape.class_name)
    {
      case "Shape_LineTo":
        this.Show_Field("x_elem", shape.pt.x);
        this.Show_Field("y_elem", shape.pt.y);
        break;
      case "Shape_MoveTo":
        this.Show_Field("x_elem", shape.pt.x);
        this.Show_Field("y_elem", shape.pt.y);
        break;
      case "Shape_Arc":
        this.Show_Field("x_elem", shape.pt.x);
        this.Show_Field("y_elem", shape.pt.y);
        this.Show_Field("radius_elem", shape.Calc_Radius());
        this.Show_Field("start_angle_elem", shape.Calc_Start_Angle());
        this.Show_Field("end_angle_elem", shape.Calc_End_Angle());
        break;
      case "Shape_Rect":
        this.Show_Field("x_elem", shape.pt.x);
        this.Show_Field("y_elem", shape.pt.y);
        this.Show_Field("x2_elem", shape.cp.x);
        this.Show_Field("y2_elem", shape.cp.y);
        break;
      case "Shape_QuadraticCurveTo":
        this.Show_Field("x_elem", shape.pt.x);
        this.Show_Field("y_elem", shape.pt.y);
        this.Show_Field("x2_elem", shape.cp.x);
        this.Show_Field("y2_elem", shape.cp.y);
        break;
    }

    this.dlg.showModal();
  }

  Show_Field(field_id, value)
  {
    const input_elem = this.querySelector("#" + field_id);
    if (input_elem)
    {
      input_elem.value = value;
      input_elem.hidden = false;
    }

    const label_elem = this.querySelector("label[for=\"" + field_id +"\"]");
    if (label_elem)
    {
      label_elem.hidden = false;
    }
  }

  Hide()
  {
    this.dlg.close();
  }

  render() 
  {
    const html = `
      <dialog id="dlg">
        <header>
          <h1 class="title" id="type_elem" class="title"></h1>
        </header>
        <main>
          <label for="x_elem">X</label>
          <input id="x_elem" type="number">

          <label for="y_elem">Y</label>
          <input id="y_elem" type="number">

          <label for="x2_elem">X2</label>
          <input id="x2_elem" type="number">

          <label for="y2_elem">Y2</label>
          <input id="y2_elem" type="number">

          <label for="radius_elem">Radius</label>
          <input id="radius_elem" type="number">

          <label for="radius_x_elem">Radius X</label>
          <input id="radius_x_elem" type="number">

          <label for="radius_y_elem">Radius Y</label>
          <input id="radius_y_elem" type="number">

          <label for="start_angle_elem">Start Angle</label>
          <input id="start_angle_elem" type="number">

          <label for="end_angle_elem">End Angle</label>
          <input id="end_angle_elem" type="number">

          <label for="width_elem">Width</label>
          <input id="width_elem" type="number">

          <label for="height_elem">Height</label>
          <input id="height_elem" type="number">

          <label for="ctrl_pt_x_elem">Control Point X</label>
          <input id="ctrl_pt_x_elem" type="number">

          <label for="ctrl_pt_y_elem">Control Point Y</label>
          <input id="ctrl_pt_y_elem" type="number">

          <label for="ctrl_pt_x2_elem">Control Point X2</label>
          <input id="ctrl_pt_x2_elem" type="number">

          <label for="ctrl_pt_y2_elem">Control Point Y2</label>
          <input id="ctrl_pt_y2_elem" type="number">
        </main>

        <footer>
          <button id="ok_btn"><img src="images/check.svg"></button>
          <button id="cancel_btn"><img src="images/close.svg"></button>
        </footer>
      </dialog>
    `;
    this.innerHTML = html;
    Utils.Set_Id_Shortcuts(this, this);

    this.ok_btn.addEventListener("click", this.On_Click_Edit_Ok);
    this.cancel_btn.addEventListener("click", this.On_Click_Cancel);
  }
}

Utils.Register_Element(Shape_Dlg);

export default Shape_Dlg;
