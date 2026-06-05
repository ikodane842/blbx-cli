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
            row = file.permissions.c_all_purple + " " + file.group.c_all_purple + " " + file.owner.c_all_purple + " " + file.size.c_all_purple + " " + file.name.c_all_purple        
        else 
            row = file.permissions.c_all_purple + " " + file.group.c_all_purple + " " + file.owner.c_all_purple + " " + file.size.c_all_purple + " " + file.name.c_all_black
        end if
        to_format.push(row)
    end for

    print to_format.fmt_cols

    return _callback.catch("", 1)
end function 

_COMMAND_.cd = function(PARAMS)
    cmd_requirements = function() 
        if not PARAMS.len then 
            print // design line
            return false
        end if 
        return true
    end function
    if not cmd_requirements then return _callback.catch("", 0)

    move_to_path = PARAMS[0].value 
    is_relative_path = false
    if not _PROGRAM_.env.root then return _callback.catch("missing remote machine object [file]...", 0)
    if move_to_path.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.root, move_to_path) else file = Directory.find_file(_PROGRAM_.env.comp.File(Prompt.get_current_path), 0, move_to_path)
    if not move_to_path.split("/").len > 1 and move_to_path != ".." then is_relative_path = true
    if move_to_path == ".." then file = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path).parent

    // analyzing data to find child files for relative path checks
    if is_relative_path then 
        found = false
        current_directory = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path)
        for child in (current_directory.get_folders + current_directory.get_files)
            if not move_to_path.indexOf(child.path) == number and move_to_path != child.name then continue 
            found = true
        end for
    end if

    // completing standard error checks
    if is_relative_path then 
        if not found then return _callback.catch("file not found...", 0)
    end if  
    if not file then return _callback.catch("file not found...", 0)
    if not file.is_folder then return _callback.catch("target is not a directory", 0)
    

    Prompt.set_current_path(file.path)
    print // design line

    return _callback.catch("", 1)
end function 

_COMMAND_.cat = function(PARAMS) 
    cmd_requirements = function()
        if not PARAMS.len then return false
        return true 
    end function
    if not cmd_requirements then return _callback.catch("", 0)

    read_file = PARAMS[0].value 
    is_relative_path = false
    if not _PROGRAM_.env.root then return _callback.catch("missing remote machine object [file]...", 0)
    if read_file.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.root, read_file)
    if not read_file.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.comp.File(Prompt.get_current_path), 0, read_file)

    // analyzing data to find child files for relative path checks
    if is_relative_path then 
        found = false
        current_directory = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path)
        for child in (current_directory.get_folders + current_directory.get_files)
            if not read_file.indexOf(child.path) == number and read_file != child.name then continue 
            found = true
        end for
    end if

    // completing standard error checks
    if is_relative_path then 
        if not found then return _callback.catch("file not found...", 0)
    end if  
    if not file then return _callback.catch("file not found...", 0)
    if file.is_folder then return _callback.catch("target is a directory", 0)

    print 
    print file.get_content.c
    print 

    return _callback.catch("", 1)
end function

_COMMAND_.sweep = function(PARAMS)
    config = {"amount": 1, "ports": [], "rhost": 0}
    init = function()
        // sweep <target amount> OPTION: -port[<port_number>, ...]
        if not PARAMS.len then
            Usage.display("sweep", Usage.get_usage_object("sweep"))
            return _callback.catch("", 0)
        end if

        target_amount = Params.extract_type(PARAMS, [TokenTypes.Float])
        if not target_amount then target_amount = "1" else target_amount = target_amount[0].value

        target_ports = Params.extract_flags(PARAMS)
        if target_ports.len then 
            for flag in target_ports
                flag = flag + " "
                if flag.is_match("\[*\]") then 
                    flag = slice(flag, flag.values.indexOf("["), flag.values.indexOf("]") + 1)
                    target_ports = Params.extract_flag_content(flag)
                end if
            end for
        end if
        if not target_ports then target_ports = []

        config.amount = target_amount 
        config.ports = target_ports

        return _callback.catch("", 1)
    end function
    error_handling = init()
    if not error_handling.status then return error_handling
    
    count = 0
    matching_ip_address_arr = []

    while count < config.amount.to_int
        config.rhost = Machine.random_ip()
        target_ports = Exploit.module.grab_ports(config.rhost, config.ports, 1)

        if not target_ports or not target_ports.len then continue 

        found = [] 
        for port in target_ports 
            for check_port in config.ports 
                if check_port.to_int == port.port_number then found.push(port)
            end for 
        end for 
        
        if not found.len == config.ports.len then continue 
        
        matching_ip_address_arr.push(config.rhost)

        //_callback.local_debug(config.rhost, "config.rhost", 10)
    
        _PROGRAM_.process.internal_run("nmap", config.rhost, 0)
        count = count + 1
    end while 



    return _callback.catch(matching_ip_address_arr, 1)
end function
_COMMAND_.sw = @_COMMAND_.sweep

_COMMAND_.nmap = function(PARAMS)
    cmd_requirements = function()
        if not PARAMS.len then return false 
        if not is_valid_ip(PARAMS[0].value) then return 2
        
        return true 
    end function
    if not cmd_requirements then return _callback.catch("", 0)
    if cmd_requirements == 2 then return _callback.catch("invalid ip address...", 0)

    router = get_router(PARAMS[0].value)
    if not router then return _callback.catch("remote target " + PARAMS[0].value + " is not reachable...", 0)

    print ("Scanning remote target " + PARAMS[0].value + " for available ports...").c.b
    if not router then return _callback.catch("interrupted, no available ports...", 0)

    info = ["PORT STATE SERVICE LAN".c_all_black]
    for port in router.used_ports 
        service_info = router.port_info(port)
        lan_address = port.get_lan_ip 
        if port.is_closed then state = "closed".c_all_purple else state = "open".c_all_black
        info.push(str(port.port_number).c_all_purple + " " + state + " " + service_info.c_all_purple + " " + lan_address.c_all_purple)
    end for

    print 
    print info.fmt_cols
    print 

    return _callback.catch("", 1)
end function

// linux