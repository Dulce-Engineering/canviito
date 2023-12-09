import Utils from "../lib/Utils.js";

class Game_Arena extends HTMLElement 
{
  static tname = "game-arena";

  constructor() 
  {
    super();
    Utils.Bind(this, "On_");

    this.to_add = [];
    this.to_remove = [];
  }

  connectedCallback()
  {
    this.Render();
  }

  get value()
  {
  }

  set value(objs)
  {
    this.objs = objs;
  }

  Start()
  {
    this.camera = 
    {
      pos:
      {
        x: this.canvas.width/2,
        y: this.canvas.height/2,
      },
      p1:
      {
        x: -this.canvas.width/2,
        y: -this.canvas.height/2
      },
      size:
      {
        x: this.canvas.width,
        y: this.canvas.height
      }
    };

    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(this.camera.pos.x, this.camera.pos.y);
    this.Continue();
  }

  Pause()
  {
    this.is_playing = false;
  }

  Continue()
  {
    this.is_playing = true;
    requestAnimationFrame(this.On_Process);
  }

  Toggle()
  {
    if (this.is_playing)
      this.Pause();
    else
      this.Continue();
  }

  Obj_Remove(obj)
  {
    this.to_remove.push(obj);
  }

  Obj_Add(obj)
  {
    this.to_add.push(obj);
  }

  To_Click_Pos(event_pt)
  {
    const rect = this.canvas.getBoundingClientRect();

    const canvas_pt =
    {
      x: event_pt.x * this.canvas.width / rect.width,
      y: event_pt.y * this.canvas.height / rect.height
    }
    const click_pos = Utils.Vec_Sub(this.camera.pos, canvas_pt);

    return click_pos;
  }

  // events =======================================================================================

  On_Process(millis) // millis since Start()
  {
    this.ctx.clearRect
    (
      this.camera.p1.x, 
      this.camera.p1.y, 
      this.camera.size.x, 
      this.camera.size.y
    ); 

    for (const obj of this.objs)
    {
      if (obj.Render)
      {
        this.ctx.save();
        if (obj.Get_Pos)
        {
          const pos = obj.Get_Pos();
          this.ctx.translate(pos.x, pos.y);
        }
        if (obj.Get_Angle)
        {
          const angle = obj.Get_Angle();
          this.ctx.rotate(angle);
        }
        if (obj.Get_Scale)
        {
          const scale = obj.Get_Scale();
          this.ctx.scale(scale.x, scale.y);
        }
        // scale
        // skew

        obj.Render(this.ctx);
        this.ctx.restore();
      }
    }

    for (const obj of this.objs)
    {
      if (obj.Process)
      {
        obj.Process(millis, this);
      }
    }

    if (!Utils.isEmpty(this.to_remove))
    {
      this.objs = this.objs.filter(o => !this.to_remove.includes(o));
      this.to_remove = [];
    }
    if (!Utils.isEmpty(this.to_add))
    {
      this.objs.push(...this.to_add);
      this.to_add = [];
    }

    if (this.is_playing)
    {
      requestAnimationFrame(this.On_Process);
    }
  }

  // rendering ====================================================================================

  Render()
  {
    //const html = `<canvas id="canvas"></canvas>`;
    //this.innerHTML = html;
    //Utils.Set_Id_Shortcuts(this, this);

    const rect = this.getBoundingClientRect();
    this.canvas = document.createElement("canvas");
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.append(this.canvas);
  }
}

Utils.Register_Element(Game_Arena);

export default Game_Arena;