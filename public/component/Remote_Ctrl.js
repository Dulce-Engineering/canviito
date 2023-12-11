import Utils from "../lib/Utils.js";

class Remote_Ctrl extends HTMLElement
{
  static tname = "remote-ctrl";

  constructor()
  {
    super();
    this.objs = null;
    this.on_change_fn = null;
    this.Change_Obj = this.Change_Obj.bind(this);
    this.pos_d = 1;
    this.scale_d = 0.01;
    this.rot_d = 0.005;

    Utils.Bind(this, "On_");
  }
  
  connectedCallback()
  {
    this.Render();
  }

  Set_Shapes(objs)
  {
    this.objs = objs; 
  }

  Change_Obj(change_fn)
  {
    let obj;

    if (this.objs && this.objs.length>0)
    {
      for (let i=0; i<this.objs.length; i++)
      {
        obj = this.objs[i];
        if (obj.selected)
        {
          change_fn = change_fn.bind(this);
          change_fn(obj);
          if (this.on_change_fn)
          {
            this.on_change_fn(obj);
          }
        }
      }
    }
  }

  Disable_Buttons()
  {
    const btns = this.querySelectorAll("button");
    if (btns && btns.length>0)
    {
      btns.forEach((btn) => btn.disabled = true);
    }
    this.close.disabled = false;
  }

  Disable_Unused_Buttons()
  {
    this.u1.disabled = true;
    this.u2.disabled = true;
    this.u3.disabled = true;
  }

  Set_Disabled(disabled)
  {
    if (disabled)
    {
      this.Disable_Buttons();
    }
    else
    {
      this.Set_Cmd(this.cmd);
    }
  }

  Show()
  {
    this.style.display = "inline-block";
  }

  // events =======================================================================================

  On_Click_Left_Up()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.x -= 1;
        pos.y -= 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x -= this.scale_d;
        obj.scale.y += this.scale_d;
      }
    }
  }

  On_Click_Up()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.y -= 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.y += this.scale_d;
      }
    }
    else if (this.cmd?.id == "rotate")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.angle += Math.PI/4;
      }
    }
  }

  On_Click_Right_Up()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.x += 1;
        pos.y -= 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x += this.scale_d;
        obj.scale.y += this.scale_d;
      }
    }
  }

  On_Click_Left()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.x -= 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x -= this.scale_d;
      }
    }
    else if (this.cmd?.id == "rotate")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.angle += this.rot_d;
      }
    }
  }

  On_Click_Right()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        if (pos)
        {
          pos.x += 1;
          obj.Set_Pos(pos);
        }
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x += this.scale_d;
      }
    }
    else if (this.cmd?.id == "rotate")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.angle -= this.rot_d;
      }
    }
  }

  On_Click_Left_Down()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.x -= 1;
        pos.y += 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x -= this.scale_d;
        obj.scale.y -= this.scale_d;
      }
    }
  }

  On_Click_Down()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.y += 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.y -= this.scale_d;
      }
    }
    else if (this.cmd?.id == "rotate")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.angle -= Math.PI/4;
      }
    }
  }

  On_Click_Right_Down()
  {
    if (this.cmd?.id == "move")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        const pos = obj.Get_Pos();
        pos.x += 1;
        pos.y += 1;
        obj.Set_Pos(pos);
      }
    }
    else if (this.cmd?.id == "scale")
    {
      this.Change_Obj(Change);
      function Change(obj)
      {
        obj.scale.x += this.scale_d;
        obj.scale.y -= this.scale_d;
      }
    }
  }

  On_Click_Cmd(event)
  {
    this.Set_Cmd(event.currentTarget);
  }

  On_Click_Close()
  {
    this.style.display = "none";
  }

  Set_Cmd(cmd)
  {
    this.cmd = cmd;
    this.Disable_Buttons();

    this.move.classList.remove("selected");
    this.rotate.classList.remove("selected");
    this.scale.classList.remove("selected");
    if (cmd)
    {
      this.cmd.classList.add("selected");
    }

    this.move.disabled = false;
    this.rotate.disabled = false;
    this.scale.disabled = false;
    if (this.cmd?.id == "rotate")
    {
      this.u.disabled = false;
      this.r.disabled = false;
      this.d.disabled = false;
      this.l.disabled = false;
    }
    else if (this.cmd?.id == "move" || this.cmd?.id == "scale")
    {
      this.lu.disabled = false;
      this.u.disabled = false;
      this.ru.disabled = false;
      this.r.disabled = false;
      this.rd.disabled = false;
      this.d.disabled = false;
      this.ld.disabled = false;
      this.l.disabled = false;
    }
  }

  Render()
  {
    this.innerHTML = `
      <div class="grid">
        <button id="lu"><img src="images/arrow-top-left-bold-outline.svg"></button>
        <button id="u"><img src="images/arrow-up-bold-outline.svg"></button>
        <button id="ru"><img src="images/arrow-top-right-bold-outline.svg"></button>
        <button id="move"><img src="images/move-resize-variant.svg"></button>
        <button id="close"><img src="images/close.svg"></button>

        <button id="l"><img src="images/arrow-left-bold-outline.svg"></button>
        <button id="u3"></button>
        <button id="r"><img src="images/arrow-right-bold-outline.svg"></button>
        <button id="rotate"><img src="images/rotate-left.svg"></button>
        <button id="u2"></button>

        <button id="ld"><img src="images/arrow-bottom-left-bold-outline.svg"></button>
        <button id="d"><img src="images/arrow-down-bold-outline.svg"></button>
        <button id="rd"><img src="images/arrow-bottom-right-bold-outline.svg"></button>
        <button id="scale"><img src="images/move-resize.svg"></button>
        <button id="u1"></button>
      </div>
    `;
    Utils.Set_Id_Shortcuts(this, this);

    this.lu.addEventListener("click", this.On_Click_Left_Up);
    this.u.addEventListener("click", this.On_Click_Up);
    this.ru.addEventListener("click", this.On_Click_Right_Up);
    this.move.addEventListener("click", this.On_Click_Cmd);
    this.close.addEventListener("click", this.On_Click_Close);

    this.l.addEventListener("click", this.On_Click_Left);
    this.r.addEventListener("click", this.On_Click_Right);
    this.rotate.addEventListener("click", this.On_Click_Cmd);

    this.ld.addEventListener("click", this.On_Click_Left_Down);
    this.d.addEventListener("click", this.On_Click_Down);
    this.rd.addEventListener("click", this.On_Click_Right_Down);
    this.scale.addEventListener("click", this.On_Click_Cmd);

    this.Set_Cmd(null);
  }
}

Utils.Register_Element(Remote_Ctrl);

export default Remote_Ctrl;