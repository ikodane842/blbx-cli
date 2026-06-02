// string prototypes
string.clean = function(find = "")
    result_string = @self 
    while typeof(result_string.indexOf(find)) == "number"
        result_string = result_string.remove(find)
    end while 
    return result_string
end function 

// array prototypes
list.format_columns = function()
    columns = {};
    longest_elem_per_col = {};
    
    rm_colors = function(string)
        start_idx = string.indexOf("<") 
        end_idx = string.indexOf(">")
      
        if typeof(start_idx) == "null" or typeof(end_idx) == "null" then return string 
        to_remove = string[start_idx:end_idx + 1]
        
        return string.clean(to_remove)
    end function

    for row in self 
        column_elements = row.split(" ")
        col_elem_count = 0
        for elem in column_elements
            if not columns.hasIndex(col_elem_count) then columns[col_elem_count] = []
            if not longest_elem_per_col.hasIndex(col_elem_count) then longest_elem_per_col[col_elem_count] = 0
            columns[col_elem_count].push(elem)
            if longest_elem_per_col[col_elem_count] < elem.len then longest_elem_per_col[col_elem_count] = rm_colors(elem).len
            col_elem_count = col_elem_count + 1
        end for
    end for

    // assemble the final product by row and append appropriate spacing in between
    formatted = []; col_idx = -1; indent = 2
    
    for col in columns.values 
        col_idx = col_idx + 1
        row_idx = -1

        for row_elem in col 
            row_idx = row_idx + 1
            if not formatted.hasIndex(row_idx) then formatted.push("") 
            formatted[row_idx] = formatted[row_idx] + " " * ((((longest_elem_per_col[col_idx] - rm_colors(row_elem).len) + indent))) + row_elem
        end for
    end for
     
    return formatted.join(char(10))
end function
list.fmt_cols = @list.format_columns
