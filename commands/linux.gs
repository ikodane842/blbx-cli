_COMMAND_.ls = function(PARAMS)
    cmd_requirements = function()
        //none
    end function
    
    current_directory = _PROGRAM_.env.comp.File(Prompt.get_current_path())
    folders = current_directory.get_folders
    files = current_directory.get_files
    to_format = [("permissions".c + " " + "group".c + " " + "owner".c + " " + "size".c + " " + "name".c)]

    for file in (folders + files)
        if file.is_folder then
            row = file.permissions.c_all_black + " " + file.group.c_all_black + " " + file.owner.c_all_black + " " + file.size.c_all_black + " " + file.name.c_all_purple        
        else 
            row = file.permissions.c_all_black + " " + file.group.c_all_black + " " + file.owner.c_all_black + " " + file.size.c_all_black + " " + file.name.c_all_black
        end if
        to_format.push(row)
    end for

    print to_format.fmt_cols

    return _callback.catch("", 1)
end function 

_COMMAND_.cd = function(PARAMS)
    cmd_requirements = function() 
        //none
    end function
    
    move_to_path = PARAMS[0].value 
    if move_to_path.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.root, move_to_path) else file = Directory.find_file(_PROGRAM_.env.root, 0, move_to_path)
    if not file then return _callback.catch("file not found...", 0)
    if not file.is_folder then _callback.catch("target is not a directory", 0)
    Prompt.set_current_path(file.path)

    return _callback.catch("", 1)
end function 